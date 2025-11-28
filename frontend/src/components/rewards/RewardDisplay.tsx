'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reward, rewardTypes } from '@/types/reward';
import { Button } from '../ui/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export interface WonReward extends Reward {
  isClaimed: boolean;
  claimedAt?: string;
  transactionHash?: string;
}

interface RewardDisplayProps {
  reward: WonReward;
  onClaim: (rewardId: string) => Promise<{ success: boolean; transactionHash?: string }>;
  className?: string;
}

export function RewardDisplay({ reward, onClaim, className = '' }: RewardDisplayProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [localReward, setLocalReward] = useState<WonReward>(reward);
  const { handleError, handleSuccess } = useErrorHandler();

  useEffect(() => {
    setLocalReward(reward);
  }, [reward]);

  const handleClaim = async () => {
    if (isClaiming || localReward.isClaimed) return;

    try {
      setIsClaiming(true);
      const { success, transactionHash } = await onClaim(localReward.id);
      
      if (success) {
        setLocalReward(prev => ({
          ...prev,
          isClaimed: true,
          claimedAt: new Date().toISOString(),
          transactionHash
        }));
        handleSuccess('Reward claimed successfully!');
      }
    } catch (error) {
      handleError(error, 'Failed to claim reward');
    } finally {
      setIsClaiming(false);
    }
  };

  const rewardType = rewardTypes[localReward.type];
  const claimDate = localReward.claimedAt ? new Date(localReward.claimedAt).toLocaleDateString() : null;

  return (
    <motion.div 
      className={`relative overflow-hidden rounded-lg border ${rewardType.border} bg-white shadow-md transition-all hover:shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rewardType.color}`}>
                {rewardType.name}
              </span>
              {localReward.isClaimed && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Claimed
                </span>
              )}
            </div>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">{localReward.name}</h3>
            <p className="mt-1 text-sm text-gray-600">{localReward.description}</p>
            
            <AnimatePresence>
              {showDetails && (
                <motion.div 
                  className="mt-3 pt-3 border-t border-gray-100"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Remaining:</span> {localReward.remaining}/{localReward.total}
                    </p>
                    {claimDate && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Claimed on:</span> {claimDate}
                      </p>
                    )}
                    {localReward.transactionHash && (
                      <p className="text-sm">
                        <a 
                          href={`https://etherscan.io/tx/${localReward.transactionHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View on Etherscan
                        </a>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            {localReward.image && (
              <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                <img
                  src={localReward.image}
                  alt={localReward.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            {showDetails ? 'Hide details' : 'View details'}
          </button>
          
          <Button
            onClick={handleClaim}
            disabled={isClaiming || localReward.isClaimed}
            className={`${localReward.isClaimed ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isClaiming ? 'Claiming...' : localReward.isClaimed ? 'Claimed' : 'Claim Reward'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
