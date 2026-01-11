import Image from "next/image";

"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { fetchRewards, openReward } from '@/services/rewards';
import { RewardsGrid } from '@/components/rewards/RewardsGrid';
import { RewardModal } from '@/components/rewards/RewardModal';
import { Reward } from '@/types/reward';
import { useEnhancedErrorHandler } from '@/hooks/useEnhancedErrorHandler';
import { useToast } from '@/hooks/useToast';
import { useRewardContract } from '@/hooks/useRewardContract';

export default function Home() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const { isConnected } = useAccount();
  const { handleContractCall, handleError } = useEnhancedErrorHandler();
  const { success, error: toastError, info } = useToast();
  const { openReward: contractOpenReward, isLoading: contractLoading, fee } = useRewardContract();

  // Fetch rewards on component mount
  useEffect(() => {
    const loadRewards = async () => {
      try {
        setIsLoading(true);
        const data = await fetchRewards();
        setRewards(data);
      } catch (err) {
        console.error('Failed to fetch rewards:', err);
        setError('Failed to load rewards. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRewards();
  }, []);

  const handleOpenReward = async (rewardId: string) => {
    if (!isConnected) {
      toastError('Wallet Required', 'Please connect your wallet to open rewards');
      return;
    }

    try {
      setIsOpening(true);
      setSelectedReward(rewards.find(r => r.id === rewardId) || null);
      setIsModalOpen(true);

      info('Opening Reward', `Processing reward box... Fee: ${Number(fee) / 1e18} ETH`);

      // Use the contract hook instead of the service
      await contractOpenReward();
      
      // Refresh rewards after successful opening
      const updatedRewards = await fetchRewards();
      setRewards(updatedRewards);
      
      success('Reward Opened!', 'Check your wallet for the new assets!');
    } catch (err: any) {
      handleError(err, {
        operation: 'Open Reward Box',
        function: 'openReward',
        contract: 'SmetReward'
      });
    } finally {
      setIsOpening(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReward(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards Collection</h1>
        <p className="text-gray-600">Open a reward and collect unique digital assets</p>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Connect your wallet to open rewards and collect digital assets.
              </p>
            </div>
          </div>
        </div>
      )}

      <RewardsGrid 
        rewards={rewards} 
        onOpenReward={handleOpenReward} 
        isLoading={isOpening || contractLoading}
        activeRewardId={isOpening && selectedReward ? selectedReward.id : undefined}
      />

      <RewardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reward={selectedReward}
        isLoading={isOpening}
      />
    </div>
  );
}
