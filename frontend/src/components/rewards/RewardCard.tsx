'use client';

import { Reward, rewardTypes } from '@/types/reward';
import Image from 'next/image';

interface RewardCardProps {
  reward: Reward;
  onOpen?: (rewardId: string) => void;
  isLoading?: boolean;
}

export function RewardCard({ reward, onOpen, isLoading = false }: RewardCardProps) {
  const rewardType = rewardTypes[reward.type];
  const probability = (reward.probability * 100).toFixed(1);
  const remainingPercentage = Math.round((reward.remaining / reward.total) * 100);

  return (
    <div 
      className={`relative flex flex-col rounded-lg overflow-hidden border ${rewardType.border} bg-white shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="relative aspect-square bg-gray-100">
        <Image 
          src={reward.image} 
          alt={reward.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm">
          <span className={rewardType.color}>
            {rewardType.name}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-1">{reward.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reward.description}</p>
        
        <div className="mt-auto space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Chance: {probability}%</span>
            <span>{reward.remaining}/{reward.total} left</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${remainingPercentage}%` }}
            />
          </div>
          
          <button
            onClick={() => onOpen?.(reward.id)}
            disabled={isLoading || reward.remaining === 0}
            className={`w-full mt-2 py-2 px-4 rounded-md font-medium text-white ${
              reward.remaining === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {isLoading ? 'Opening...' : 'Open Reward'}
          </button>
        </div>
      </div>
    </div>
  );
}
