import { useSmetReward } from '@/lib/web3/useSmetReward';

interface UseRewardContractProps {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useRewardContract(options: UseRewardContractProps = {}) {
  // Backwards-compatible hook wrapper delegating to the new Web3 layer
  return useSmetReward({ onSuccess: options.onSuccess, onError: options.onError });
}
