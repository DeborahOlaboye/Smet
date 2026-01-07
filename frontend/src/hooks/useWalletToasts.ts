import { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useToast } from '@/hooks/useToast';

export function useWalletToasts() {
  const { isConnected, address } = useAccount();
  const { success, info, error } = useToast();

  useEffect(() => {
    if (isConnected && address) {
      success(
        'Wallet Connected',
        `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`
      );
    }
  }, [isConnected, address, success]);

  const handleConnect = (connect: any, connectors: any[]) => {
    try {
      info('Connecting Wallet', 'Please approve the connection in your wallet');
      connect({ connector: connectors[0] });
    } catch (err) {
      error('Connection Failed', 'Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = (disconnect: any) => {
    try {
      disconnect();
      info('Wallet Disconnected', 'Your wallet has been disconnected');
    } catch (err) {
      error('Disconnection Failed', 'Failed to disconnect wallet');
    }
  };

  return {
    handleConnect,
    handleDisconnect
  };
}