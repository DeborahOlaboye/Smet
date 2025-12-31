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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isMounted || !isOpen || !reward) return null;

  const rewardType = rewardTypes[reward.type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        
        <div className="relative w-full sm:w-full sm:max-w-md bg-white sm:rounded-2xl shadow-xl transform transition-all">
          {/* Mobile: Full screen bottom sheet style */}
          <div className="sm:hidden">
            <div className="flex justify-center pt-2 pb-4">
              <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          
          {/* Desktop: Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 btn-touch"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          <div className="p-6 sm:p-6 text-center">
            <div className="mx-auto flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Image
                src={reward.image}
                alt={reward.name}
                width={120}
                height={120}
                className="h-24 w-24 sm:h-30 sm:w-30 object-contain"
              />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {isLoading ? 'Opening...' : 'You won!'}
            </h3>
            
            {isLoading && (
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {!isLoading && (
              <>
                <p className="text-sm sm:text-base text-gray-500 mb-2">
                  You've won a <span className={`font-medium ${rewardType.color}`}>
                    {rewardType.name}
                  </span> reward!
                </p>
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-1">{reward.name}</p>
                <p className="text-sm sm:text-base text-gray-500 mb-6 px-4">{reward.description}</p>
                
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full btn-touch rounded-md bg-blue-600 px-4 py-3 text-sm sm:text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 transition-colors"
                  >
                    Claim Reward
                  </button>
                  
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full btn-touch rounded-md border border-gray-300 bg-white px-4 py-3 text-sm sm:text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Mobile: Safe area padding */}
          <div className="sm:hidden pb-safe"></div>
        </div>
      </div>
    </div>
  );
}
