import React, { createContext, useContext, ReactNode } from 'react';
import { useAddress, useContract, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

// Define types for the campaign and form data
interface Campaign {
  owner: string;
  title: string;
  description: string;
  target: string;
  deadline: number;
  amountCollected: string;
  image: string;
  pId: number;
}

interface FormData {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
}

// Add types for the parameters of `donate` and `getDonations`
interface StateContextType {
  address: string | undefined;
  contract: any; // Could be more specific if you know the contract interface
  createCampaign: (form: FormData) => Promise<void>;
  connect: () => void;
  getCampaigns: () => Promise<Campaign[]>;
  getUserCampaigns: () => Promise<Campaign[]>; // Added getUserCampaigns here
  donate: (pId: number, amount: string) => Promise<any>; // Added types for pId and amount
  getDonations: (pId: number) => Promise<any[]>; // Added types for pId
}

interface StateContextProviderProps {
  children: ReactNode;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateContextProvider: React.FC<StateContextProviderProps> = ({ children }) => {
  const { contract } = useContract('0x7C68c62FD2b8099c40e8ABcCCeA3EF7Dd84E8aB7');
  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');
  const address = useAddress();

  const connect = () => {
    console.log('Wallet connected');
  };

  const publishCampaign = async (form: FormData) => {
    try {
      if (!address) {
        alert("Please connect your wallet first.");
        return;
      }

      const data = await createCampaign({
        args: [
          address,
          form.title,
          form.description,
          ethers.utils.parseUnits(form.target, 'ether'),
          Math.floor(new Date(form.deadline).getTime() / 1000),
          form.image,
        ],
      });

      console.log('Contract call success:', data);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Contract call failure:', error.message);
      } else {
        console.error('Contract call failure:', error);
      }
    }
  };

  const getCampaigns = async (): Promise<Campaign[]> => {
    if (!contract) {
      throw new Error('Contract is not defined');
    }

    const campaigns = await contract.call('getCampaigns');
    const parsedCampaigns = campaigns.map((campaign: any, i: number) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i
    }));

    return parsedCampaigns;
  };

  const getUserCampaigns = async (): Promise<Campaign[]> => {
    const allCampaigns = await getCampaigns();
    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);
    return filteredCampaigns;
  };

  const donate = async (pId: number, amount: string): Promise<any> => {
    if (!contract) {
      throw new Error('Contract is not defined');
    }

    const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount) });
    return data;
  };

  const getDonations = async (pId: number): Promise<any[]> => {
    if (!contract) {
      throw new Error('Contract is not defined');
    }

    const donations = await contract.call('getDonators', [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];
    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      });
    }

    return parsedDonations;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        createCampaign: publishCampaign,
        connect,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = (): StateContextType => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a StateContextProvider');
  }
  return context;
};
