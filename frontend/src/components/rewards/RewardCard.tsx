'use client';

import { Reward, rewardTypes } from '@/types/reward';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import { useTier } from '@/lib/web3/useTier';

interface RewardCardProps {
  reward: Reward;
  onOpen?: (rewardId: string) => void;
  isLoading?: boolean;
}

import { Tier } from '@/types/tier';

function TierBadge() {
  const { tier, isLoading } = useTier();
  if (isLoading) return <span>…</span>;
  if (!tier || tier < Tier.Bronze || tier > Tier.Platinum) return <span className="text-xs text-muted">None</span>;
  const names = ['None', 'Bronze', 'Silver', 'Gold', 'Platinum'];
  return <span className="text-xs font-medium text-amber-600">{names[tier]}</span>;
}

export function RewardCard({ reward, onOpen, isLoading = false }: RewardCardProps) {
  const rewardType = rewardTypes[reward.type];
  const probability = (reward.probability * 100).toFixed(1);
  const remainingPercentage = Math.round((reward.remaining / reward.total) * 100);

  return (
    <div 
      className={`relative flex flex-col rounded-lg overflow-hidden border ${rewardType.border} bg-white shadow-sm hover:shadow-md transition-all duration-200 active:scale-95`}
    >
      <div className="relative aspect-square bg-gray-100">
        <Image 
          src={reward.image} 
          alt={reward.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={false}
        />
        <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm">
          <span className={rewardType.color}>
            {rewardType.name}
          </span>
          <span className="text-[10px] text-muted">
            {/* Show tier if connected */}
            <TierBadge />
          </span>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">{reward.name}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{reward.description}</p>
        
        <div className="mt-auto space-y-2">
          <div className="flex justify-between text-xs sm:text-sm text-gray-500">
            <span>Chance: {probability}%</span>
            <span>{reward.remaining}/{reward.total} left</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-500" 
              style={{ width: `${remainingPercentage}%` }}
            />
          </div>
          
          <Button
            onClick={() => onOpen?.(reward.id)}
            disabled={isLoading || reward.remaining === 0}
            className={`w-full mt-2 py-2.5 sm:py-2 px-4 rounded-md font-medium text-white text-sm sm:text-base btn-touch ${
              reward.remaining === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            } transition-colors disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Opening...</span>
              </div>
            ) : (
              'Open Reward'
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}
