import { createCampaign, dashboard, logout, payment, profile, withdraw } from '../assets'; // index.ts

type NavLink = {
  name: string;
  imgUrl: string;
  link: string;
  disabled?: boolean; // Optional property
  styles?: string;
};

export const navlinks: NavLink[] = [
  {
    name: 'dashboard',
    imgUrl: dashboard,
    link: '/',
     styles: "custom-style-for-dashboard",
  },
  {
    name: 'campaign',
    imgUrl: createCampaign,
    link: '/create-campaign',
  },
  {
    name: 'payment',
    imgUrl: payment,
    link: '/',
    disabled: true,
  },
  {
    name: 'withdraw',
    imgUrl: withdraw,
    link: '/',
    disabled: true,
  },
  {
    name: 'profile',
    imgUrl: profile,
    link: '/profile',
  },
  {
    name: 'logout',
    imgUrl: logout,
    link: '/',
    disabled: true,
  },
];
