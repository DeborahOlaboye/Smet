import { REWARD_CONTRACT_ADDRESS, REWARD_CONTRACT_ABI } from '@/config/contracts';

export function getRewardContractConfig() {
  return {
    address: REWARD_CONTRACT_ADDRESS,
    abi: REWARD_CONTRACT_ABI,
  } as const;
}
