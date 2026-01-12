import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { fetchRewards } from '@/services/rewards';
import { RewardEventService } from '@/services/rewardEvents';
import { Reward } from '@/types/reward';
import { useToast } from './useToast';

export function useRealTimeRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { success, info } = useToast();

  const loadRewards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchRewards();
      setRewards(data);
    } catch (err: any) {
      console.error('Failed to fetch rewards:', err);
      setError(err.message || 'Failed to load rewards from blockchain');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  // Set up real-time event listeners
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = RewardEventService.subscribeToRewardEvents(
      (openedEvent) => {
        console.log('Reward box opened:', openedEvent);
        if (openedEvent.opener === address) {
          info('Reward Processing', 'Your reward box is being processed...');
        }
      },
      (rewardOutEvent) => {
        console.log('Reward distributed:', rewardOutEvent);
        if (rewardOutEvent.opener === address) {
          const { reward } = rewardOutEvent;
          let rewardName = 'Unknown Reward';
          
          if (reward.assetType === 1) {
            rewardName = `${Number(reward.idOrAmount) / 1e18} Tokens`;
          } else if (reward.assetType === 2) {
            rewardName = `NFT #${reward.idOrAmount}`;
          } else if (reward.assetType === 3) {
            rewardName = `Loot Item #${reward.idOrAmount}`;
          }

          success('Reward Received!', `You got: ${rewardName}`);
          
          // Refresh rewards to show updated counts
          loadRewards();
        }
      }
    );

    return unsubscribe;
  }, [isConnected, address, info, success, loadRewards]);

  return {
    rewards,
    isLoading,
    error,
    refetch: loadRewards,
  };
}