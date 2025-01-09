import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
import { StateContextProvider } from './context'; 
import App from './App';
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
import './index.css';

root.render(
    <React.StrictMode>
      <ThirdwebProvider activeChain={11155111}>
        <Router>
        <StateContextProvider>
           <App />
        </StateContextProvider>
        </Router>
      </ThirdwebProvider>
    </React.StrictMode>
);
