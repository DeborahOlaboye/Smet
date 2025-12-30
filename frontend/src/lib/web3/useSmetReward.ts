import { useCallback, useState } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { getRewardContractConfig } from './contracts';

interface UseSmetRewardOptions {
  paymentInNative?: boolean;
  price?: string; // in ether
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useSmetReward({ paymentInNative = true, price = '0.01', onSuccess, onError }: UseSmetRewardOptions = {}) {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { address: rewardAddress, abi } = getRewardContractConfig();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: rewardAddress,
    abi,
    functionName: 'open',
    args: [paymentInNative],
    value: parseEther(price),
    enabled: !!address,
  });

  const { data, writeAsync: openReward, isLoading: isWriteLoading } = useContractWrite({
    ...config,
    onSuccess: (data) => setTxHash(data.hash),
    onError: (error) => onError?.(error),
  });

  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess, isError: isTransactionError, error: transactionError } = useWaitForTransaction({
    hash: txHash,
    onSuccess: (receipt) => onSuccess?.(receipt),
    onError: (error) => onError?.(error),
  });

  const estimateGas = useCallback(async () => {
    if (!openReward) return null;
    try {
      const gasEstimate = await (openReward as any).estimateGas();
      return gasEstimate.toString();
    } catch (error) {
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
