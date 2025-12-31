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
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No rewards available</h3>
        <p className="mt-1 text-muted">Check back later for new rewards!</p>
      </div>
    );
  }

  const placeholders = new Array(8).fill(0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {isLoading
        ? placeholders.map((_, idx) => (
            <div key={`ph-${idx}`}>
              <RewardCard
                reward={{ id: `ph-${idx}`, name: '', description: '', image: '/placeholder.png', type: 'loot', total: 1, remaining: 1, probability: 0 }} as any
                onOpen={() => {}}
                isLoading={true}
              />
            </div>
          ))
        : rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onOpen={onOpenReward}
              isLoading={false}
            />
          ))}
    </div>
  );
}
