'use client';

import { Reward } from '@/types/reward';
import { RewardCard } from './RewardCard';

interface RewardsGridProps {
  rewards: Reward[];
  onOpenReward: (rewardId: string) => void;
  isLoading: boolean;
  activeRewardId?: string;
}

export function RewardsGrid({ 
  rewards, 
  onOpenReward, 
  isLoading, 
  activeRewardId 
}: RewardsGridProps) {
  if (rewards.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No rewards available</h3>
        <p className="mt-1 text-gray-500">Check back later for new rewards!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rewards.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          onOpen={onOpenReward}
          isLoading={isLoading && activeRewardId === reward.id}
        />
      ))}
    </div>
  );
}
