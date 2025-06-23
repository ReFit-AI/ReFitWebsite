import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';
import { authService } from '../services/api';

// Type definitions
interface AuthorizationResult {
  accounts: Array<{ address: string; label?: string }>;
  auth_token: string;
  wallet_uri_base: string;
}

// Context for Solana connection
interface SolanaContextValue {
  connection: Connection;
  walletAddress: PublicKey | null;
  authorizationResult: AuthorizationResult | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: Transaction) => Promise<string>;
}

const SolanaContext = React.createContext<SolanaContextValue | null>(null);

export const useSolana = () => {
  const context = React.useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within SolanaProvider');
  }
  return context;
};

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: React.FC<SolanaProviderProps> = ({ children }) => {
  const [authorizationResult, setAuthorizationResult] = useState<AuthorizationResult | null>(null);
  const [walletAddress, setWalletAddress] = useState<PublicKey | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Use devnet for development, mainnet-beta for production
  const connection = new Connection(
    __DEV__ ? clusterApiUrl('devnet') : clusterApiUrl('mainnet-beta'),
    'confirmed'
  );

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const session = await authService.getSession();
      if (session.walletAddress && session.token) {
        setWalletAddress(new PublicKey(session.walletAddress));
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // For demo purposes, use a mock wallet connection
      // In production, this would use Solana Mobile Wallet Adapter
      console.log('Demo mode: Using mock wallet connection');
      const mockAddress = new PublicKey('DemoWa11et111111111111111111111111111111111');
      setWalletAddress(mockAddress);
      
      // Mock authorization result
      setAuthorizationResult({
        accounts: [{ address: mockAddress.toBase58() }],
        auth_token: 'demo-token',
        wallet_uri_base: 'demo://wallet',
      });
      
      try {
        await authService.connect(mockAddress.toBase58());
      } catch (error) {
        console.log('Backend connection skipped in demo mode');
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    // In production, this would deauthorize with the wallet
    setAuthorizationResult(null);
    setWalletAddress(null);
    
    try {
      await authService.disconnect();
    } catch (error) {
      console.log('Disconnect error:', error);
    }
  }, []);

  const signAndSendTransaction = useCallback(
    async (transaction: Transaction): Promise<string> => {
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        // In production, this would sign and send the transaction
        // For demo, return a mock signature
        console.log('Demo mode: Mock transaction signature');
        return 'DemoTxSignature1111111111111111111111111111111111111111111111111';
      } catch (error) {
        console.error('Transaction error:', error);
        throw error;
      }
    },
    [walletAddress]
  );

  const value: SolanaContextValue = {
    connection,
    walletAddress,
    authorizationResult,
    isConnecting,
    connect,
    disconnect,
    signAndSendTransaction,
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
};