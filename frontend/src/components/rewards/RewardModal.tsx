'use client';

import { Reward, rewardTypes } from '@/types/reward';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
  isLoading: boolean;
}

export function RewardModal({ isOpen, onClose, reward, isLoading }: RewardModalProps) {
  if (!isOpen || !reward) return null;

  const rewardType = rewardTypes[reward.type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        
        <div className="relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-gray-100/60 dark:hover:bg-white/5"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="text-center">
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Image
                src={reward.image}
                alt={reward.name}
                width={120}
                height={120}
                className="h-30 w-30 object-contain"
              />
            </div>
            
            <h3 className="mt-4 text-2xl font-bold">
              {isLoading ? 'Opening...' : 'You won!'}
            </h3>
            
            {!isLoading && (
              <>
                <p className="mt-2 text-muted">
                  You've won a <span className={`font-medium ${rewardType.color}`}>
                    {rewardType.name}
                  </span> reward!
                </p>
                <p className="mt-1 text-lg font-medium">{reward.name}</p>
                <p className="mt-2 text-sm text-muted">{reward.description}</p>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] shadow-sm hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                  >
                    Claim Reward
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
