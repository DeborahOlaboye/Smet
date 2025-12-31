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
    <Card className={`relative flex flex-col overflow-hidden ${rewardType.border} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="relative aspect-square bg-gray-100">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <Image 
            src={reward.image} 
            alt={reward.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-2">
          <span className={rewardType.color}>
            {rewardType.name}
          </span>
          <span className="text-[10px] text-muted">
            {/* Show tier if connected */}
            <TierBadge />
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-1">{isLoading ? <Skeleton className="h-6 w-32" /> : reward.name}</h3>
        <p className="text-sm text-muted mb-3 line-clamp-2">{isLoading ? <Skeleton className="h-4 w-full" /> : reward.description}</p>
        
        <div className="mt-auto space-y-2">
          <div className="flex justify-between text-sm text-muted">
            <span>{isLoading ? <Skeleton className="h-4 w-24" /> : `Chance: ${probability}%`}</span>
            <span>{isLoading ? <Skeleton className="h-4 w-20" /> : `${reward.remaining}/${reward.total} left`}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[var(--primary)] h-2 rounded-full transition-all duration-500" 
              style={{ width: `${isLoading ? 60 : remainingPercentage}%` }}
            />
          </div>
          
          <Button
            onClick={() => onOpen?.(reward.id)}
            disabled={isLoading || reward.remaining === 0}
            className="w-full mt-2"
          >
            {isLoading ? 'Opening...' : (reward.remaining === 0 ? 'Sold out' : 'Open Reward')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
