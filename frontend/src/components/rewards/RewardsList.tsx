'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RewardDisplay, WonReward } from './RewardDisplay';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface RewardsListProps {
  rewards: WonReward[];
  onClaimReward: (rewardId: string) => Promise<{ success: boolean; transactionHash?: string }>;
  className?: string;
  emptyState?: React.ReactNode;
}

export function RewardsList({ 
  rewards, 
  onClaimReward, 
  className = '',
  emptyState = <DefaultEmptyState />
}: RewardsListProps) {
  const { handleError } = useErrorHandler();
  const [claimingIds, setClaimingIds] = useState<Set<string>>(new Set());

  const handleClaim = async (rewardId: string) => {
    try {
      setClaimingIds(prev => new Set(prev).add(rewardId));
      const result = await onClaimReward(rewardId);
      return result;
    } catch (error) {
      handleError(error, 'Failed to process claim');
      return { success: false };
    } finally {
      setClaimingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(rewardId);
        return newSet;
      });
    }
  };

  if (rewards.length === 0) {
    return <div className={`text-center py-8 ${className}`}>{emptyState}</div>;
  }

  return (
    <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {rewards.map((reward, index) => (
        <motion.div
          key={reward.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <RewardDisplay 
            reward={{
              ...reward,
              isClaimed: reward.isClaimed || claimingIds.has(reward.id)
            }} 
            onClaim={handleClaim} 
          />
        </motion.div>
      ))}
    </div>
  );
}

function DefaultEmptyState() {
  return (
    <div className="text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No rewards yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        You haven't won any rewards yet. Keep participating to win exciting prizes!
      </p>
    </div>
  );
}
