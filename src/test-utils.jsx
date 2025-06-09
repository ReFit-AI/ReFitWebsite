import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

export * from '@testing-library/react';

export const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return {
    ...render(<Router>{ui}</Router>),
  };
};

export const renderWithProviders = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <Router>
      {children}
    </Router>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
};

// Mock for Solana wallet
export const mockWallet = {
  publicKey: { toBase58: () => 'mockPublicKey' },
  signTransaction: jest.fn(),
  signAllTransactions: jest.fn(),
  signMessage: jest.fn(),
  connected: true,
  connect: jest.fn(),
  disconnect: jest.fn(),
};

// Mock for Solana wallet context
export const mockWalletContext = {
  publicKey: { toBase58: () => 'mockPublicKey' },
  connected: true,
  connect: jest.fn(),
  disconnect: jest.fn(),
  wallet: mockWallet,
};

// Mock for Solana connection
export const mockConnection = {
  getAccountInfo: jest.fn(),
  getBalance: jest.fn(),
  getRecentBlockhash: jest.fn(),
  sendTransaction: jest.fn(),
  confirmTransaction: jest.fn(),
};
