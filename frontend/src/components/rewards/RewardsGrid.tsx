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
  if (rewards.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No rewards available</h3>
        <p className="text-sm sm:text-base text-gray-500">Check back later for new rewards!</p>
      </div>
    );
  }

  const placeholders = new Array(8).fill(0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
