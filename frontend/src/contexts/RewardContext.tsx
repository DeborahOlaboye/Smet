'use client';

import { createContext, useContext, ReactNode, useCallback, useState } from 'react';
import { useRewardContract } from '@/hooks/useRewardContract';
import { useToast } from '@/components/ui/use-toast';
import { parseEther } from 'viem';

interface RewardContextType {
  openReward: (rewardId: string) => Promise<void>;
  estimateGas: () => Promise<string | null>;
  txHash: `0x${string}` | undefined;
  isOpening: boolean;
  isSuccess: boolean;
  error: Error | null;
  reset: () => void;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export function RewardProvider({ children }: { children: ReactNode }) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { toast } = useToast();

  const handleSuccess = useCallback((data: any) => {
    setIsOpening(false);
    toast({
      title: 'Success',
      description: 'Reward opened successfully!',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  const handleError = useCallback((error: Error) => {
    console.error('Reward error:', error);
    setIsOpening(false);
    setError(error);
    
    toast({
      title: 'Error',
      description: error.message || 'Failed to open reward',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  const {
    openReward: contractOpenReward,
    estimateGas,
    isLoading,
    isSuccess,
    error: contractError,
  } = useRewardContract({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const openReward = useCallback(async (rewardId: string) => {
    try {
      setError(null);
      setIsOpening(true);
      
      // Show pending toast
      toast({
        title: 'Processing',
        description: 'Opening reward...',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Execute the contract call
      const tx = await contractOpenReward();
      setTxHash(tx.hash);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to open reward');
      handleError(error);
      throw error;
    }
  }, [contractOpenReward, handleError, toast]);

  const reset = useCallback(() => {
    setError(null);
    setTxHash(undefined);
  }, []);

  return (
    <RewardContext.Provider
      value={{
        openReward,
        estimateGas,
        txHash,
        isOpening: isOpening || isLoading,
        isSuccess,
        error: error || contractError || null,
        reset,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardProvider');
  }
  return context;
}
