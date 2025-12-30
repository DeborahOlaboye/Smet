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

// Hook that encapsulates the prepare → write → wait flow for calling `SmetReward.open()`.
// It centralizes common logic (fee handling, transaction state, gas estimate) so
// components using it don't have to wire Wagmi hooks directly.
export function useSmetReward({ paymentInNative = true, price = '0.01', onSuccess, onError }: UseSmetRewardOptions = {}) {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { address: rewardAddress, abi } = getRewardContractConfig();

  // Prepare the transaction config for calling `open(paymentInNative)`.
  // - `value` is encoded using parseEther to convert an Ether string to the
  //   appropriate BigInt format for the request.
  // - `enabled: !!address` prevents preparation until the user has connected
  //   a wallet (we need an address to sign/send the tx).
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

  // Provide a convenience method to estimate gas for the `open` call.
  // Note: this uses the `estimateGas` helper off the prepared `writeAsync` call
  // and may be unavailable depending on the provider or the prepared config.
  const estimateGas = useCallback(async () => {
    if (!openReward) return null;
    try {
      const gasEstimate = await (openReward as any).estimateGas();
      return gasEstimate.toString();
    } catch (error) {
      // If estimation fails, return null and let the UI fall back to a default
      // or prompt the user to proceed without an estimate.
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
