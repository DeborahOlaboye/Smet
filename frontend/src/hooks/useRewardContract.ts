import { useCallback, useState } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { REWARD_CONTRACT_ADDRESS, REWARD_CONTRACT_ABI } from '@/config/contracts';

interface UseRewardContractProps {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useRewardContract({ onSuccess, onError }: UseRewardContractProps = {}) {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  // Prepare the contract write for opening a reward
  const { config, error: prepareError } = usePrepareContractWrite({
    address: REWARD_CONTRACT_ADDRESS,
    abi: REWARD_CONTRACT_ABI,
    functionName: 'open',
    args: [true], // payInNative = true
    value: parseEther('0.01'), // Example fee, adjust based on your contract
    enabled: !!address,
  });

  // Execute the contract write
  const { data, writeAsync: openReward, isLoading: isWriteLoading } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      setTxHash(data.hash);
    },
    onError: (error) => {
      console.error('Error sending transaction:', error);
      onError?.(error);
    },
  });

  // Wait for the transaction to be mined
  const {
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccess,
    isError: isTransactionError,
    error: transactionError,
  } = useWaitForTransaction({
    hash: txHash,
    onSuccess: (receipt) => {
      onSuccess?.(receipt);
    },
    onError: (error) => {
      console.error('Transaction error:', error);
      onError?.(error);
    },
  });

  // Get estimated gas for the transaction
  const estimateGas = useCallback(async () => {
    if (!openReward) return null;
    try {
      const gasEstimate = await openReward.estimateGas();
      return gasEstimate.toString();
    } catch (error) {
      console.error('Error estimating gas:', error);
      return null;
    }
  }, [openReward]);

  return {
    openReward: async () => {
      if (!openReward) {
        const error = new Error('Contract write not ready');
        onError?.(error);
        throw error;
      }
      return openReward();
    },
    estimateGas,
    isLoading: isWriteLoading || isTransactionLoading,
    isSuccess: isTransactionSuccess,
    isError: isTransactionError || !!prepareError,
    error: transactionError || prepareError,
    txHash,
    data,
  };
}
