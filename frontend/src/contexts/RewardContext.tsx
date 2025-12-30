'use client';

import { createContext, useContext, ReactNode, useCallback, useState } from 'react';
import { useSmetReward } from '@/lib/web3/useSmetReward';
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

// RewardContext centralises the logic for the open reward flow so that UI
// components can simply call `openReward` without dealing with transaction
// lifecycle, toasts, or error handling directly.
const RewardContext = createContext<RewardContextType | undefined>(undefined);

export function RewardProvider({ children }: { children: ReactNode }) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { toast } = useToast();

  // Called when the transaction is confirmed. It clears the loading state
  // and shows a success toast. The full receipt is available via `data`.
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

  // Called on any error during prepare, write or transaction confirmation.
  // We capture the Error object, show a toast and persist the error in state
  // so consuming components can render helpful UI.
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
    isError: isHookError,
    error: contractError,
  } = useSmetReward({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const openReward = useCallback(async (rewardId: string) => {
    try {
      setError(null);
      setIsOpening(true);
      
      // Show pending toast so users know work has started.
      toast({
        title: 'Processing',
        description: 'Opening reward...',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Execute the contract call. We intentionally do not await full
      // confirmation here — the hook will call `handleSuccess` once the
      // transaction is mined. We still capture the immediate tx hash to show
      // progress in the UI.
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
