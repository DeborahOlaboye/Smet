import { useCallback, useState } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction, useContractRead } from 'wagmi';
import { REWARD_CONTRACT_ADDRESS, REWARD_CONTRACT_ABI } from '@/config/contracts';
import { useTransactionToasts } from './useTransactionToasts';
import { useToast } from './useToast';

export function useRewardContract() {
  const { address, isConnected } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { notifyTransactionSubmitted, notifyTransactionConfirmed, notifyTransactionFailed } = useTransactionToasts();
  const { error: toastError } = useToast();

  // Read contract fee
  const { data: fee } = useContractRead({
    address: REWARD_CONTRACT_ADDRESS,
    abi: REWARD_CONTRACT_ABI,
    functionName: 'fee',
    enabled: isConnected,
  });

  // Prepare contract write
  const { config, error: prepareError } = usePrepareContractWrite({
    address: REWARD_CONTRACT_ADDRESS,
    abi: REWARD_CONTRACT_ABI,
    functionName: 'open',
    args: [true],
    value: fee,
    enabled: !!address && !!fee,
  });

  // Execute contract write
  const { writeAsync, isLoading: isWriteLoading } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      setTxHash(data.hash);
      notifyTransactionSubmitted(data.hash);
    },
    onError: (error) => {
      console.error('Transaction failed:', error);
      notifyTransactionFailed(error.message);
    },
  });

  // Wait for transaction confirmation
  const { isLoading: isTransactionLoading, isSuccess } = useWaitForTransaction({
    hash: txHash,
    onSuccess: (receipt) => {
      notifyTransactionConfirmed(receipt.transactionHash, 'Reward box opened successfully!');
    },
    onError: (error) => {
      console.error('Transaction confirmation failed:', error);
      notifyTransactionFailed('Transaction confirmation failed');
    },
  });

  const openReward = useCallback(async () => {
    if (!isConnected) {
      toastError('Wallet Not Connected', 'Please connect your wallet to open rewards');
      throw new Error('Wallet not connected');
    }

    if (!writeAsync) {
      toastError('Contract Error', 'Unable to prepare transaction');
      throw new Error('Contract write not ready');
    }

    if (prepareError) {
      toastError('Preparation Error', prepareError.message);
      throw prepareError;
    }

    try {
      const result = await writeAsync();
      return result;
    } catch (error: any) {
      console.error('Error opening reward:', error);
      throw error;
    }
  }, [isConnected, writeAsync, prepareError, toastError]);

  return {
    openReward,
    isLoading: isWriteLoading || isTransactionLoading,
    isSuccess,
    txHash,
    fee: fee ? fee.toString() : '0',
    error: prepareError,
  };
}
