import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useContract, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

// Define Types
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

interface StateContextType {
  address: string | undefined;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  contract: any;
  createCampaign: (form: FormData) => Promise<void>;
  connect: () => Promise<void>;
  getCampaigns: () => Promise<Campaign[]>;
  getUserCampaigns: () => Promise<Campaign[]>;
  donate: (pId: number, amount: string) => Promise<any>;
  getDonations: (pId: number) => Promise<any[]>;
}

interface StateContextProviderProps {
  children: ReactNode;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateContextProvider: React.FC<StateContextProviderProps> = ({ children }) => {
  const { contract } = useContract('0x7C68c62FD2b8099c40e8ABcCCeA3EF7Dd84E8aB7'); // Replace with your contract address
  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');
  const [address, setAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchAddress = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAddress(accounts[0]);
          console.log('Wallet connected:', accounts[0]);
        } catch (error) {
          console.error('Error fetching wallet address:', error);
        }
      } else {
        console.error('Ethereum wallet not detected');
      }
    };

    fetchAddress();
  }, []);

  // Wallet Connection Function
  const connect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAddress(accounts[0]);
        console.log('Wallet connected:', accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to connect your wallet.');
    }
  };

  // Publish Campaign Function
  const publishCampaign = async (form: FormData) => {
    try {
      if (!address) {
        alert('Please connect your wallet first.');
        return;
      }

      if (!contract) {
        alert('Contract is not available.');
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
      console.error('Contract call failure:', error);
    }
  };

  // Fetch Campaigns
  const getCampaigns = async (): Promise<Campaign[]> => {
    if (!contract) throw new Error('Contract is not defined');

    const campaigns = await contract.call('getCampaigns');
    return campaigns.map((campaign: any, i: number) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i,
    }));
  };

  // Fetch User Campaigns
  const getUserCampaigns = async (): Promise<Campaign[]> => {
    const allCampaigns = await getCampaigns();
    return allCampaigns.filter((campaign) => campaign.owner === address);
  };

  // Donate to Campaign
  const donate = async (pId: number, amount: string): Promise<any> => {
    if (!contract) throw new Error('Contract is not defined');

    const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount) });
    return data;
  };

  // Fetch Donations
  const getDonations = async (pId: number): Promise<any[]> => {
    if (!contract) throw new Error('Contract is not defined');

    const donations = await contract.call('getDonators', [pId]);
    return donations[0].map((donator: string, index: number) => ({
      donator,
      donation: ethers.utils.formatEther(donations[1][index].toString()),
    }));
  };

  return (
    <StateContext.Provider
      value={{
        address,
        setAddress,
        contract,
        createCampaign: publishCampaign,
        connect,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
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
