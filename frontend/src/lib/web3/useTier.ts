import { useAccount } from 'wagmi';
import { useContractRead } from 'wagmi';
import { getRewardContractConfig } from './contracts';

export function useTier() {
  const { address } = useAccount();
  const { address: rewardAddress, abi } = getRewardContractConfig();

  const { data, isError, isLoading } = useContractRead({
    address: rewardAddress,
    abi,
    functionName: 'getTierOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    enabled: !!address,
    watch: true,
  });

  const tier = typeof data === 'bigint' ? Number(data) : (data ? Number(data) : 0);

  return {
    tier,
    isLoading,
    isError,
  };
}
