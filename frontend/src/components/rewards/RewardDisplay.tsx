'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reward, rewardTypes } from '@/types/reward';
import { Button } from '../ui/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Check, ExternalLink, Info, Loader2, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

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
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md',
        rewardType.border,
        localReward.isClaimed && 'opacity-90 hover:opacity-100',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
    >
      {localReward.isClaimed && (
        <div className="absolute right-2 top-2 z-10">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Check className="h-3 w-3" />
            Claimed
          </Badge>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn(rewardType.color, 'font-medium')}>
                {rewardType.name}
              </Badge>

              {localReward.availableAfter && localReward.availableAfter > Math.floor(Date.now() / 1000) && (
                <Badge variant="destructive" className="font-medium">
                  Locked
                </Badge>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground cursor-help">
                      <Info className="h-3.5 w-3.5 mr-1" />
                      {Math.round(localReward.probability * 100)}% drop rate
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Chance to receive this reward</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <h3 className="mt-3 text-xl font-bold tracking-tight">{localReward.name}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{localReward.description}</p>
            
            <AnimatePresence>
              <motion.div 
                className="overflow-hidden"
                initial={false}
                animate={{ 
                  height: showDetails ? 'auto' : 0,
                  opacity: showDetails ? 1 : 0,
                  marginTop: showDetails ? '0.75rem' : 0
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-medium">{localReward.remaining} / {localReward.total}</p>
                    </div>
                    {claimDate && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Claimed on</p>
                        <p className="font-medium">{claimDate}</p>
                      </div>
                    )}
                  </div>
                  
                  {localReward.transactionHash && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs justify-between group/button"
                      asChild
                    >
                      <a 
                        href={`https://etherscan.io/tx/${localReward.transactionHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between"
                      >
                        <span>View on Etherscan</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/button:opacity-100 transition-opacity" />
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex-shrink-0">
            {localReward.image ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted/50">
                <img
                  src={localReward.image}
                  alt={localReward.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {localReward.isClaimed && (
                  <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px]" />
                )}
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                <Sparkles className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide details' : 'View details'}
          </Button>
          
          <Button
            onClick={handleClaim}
            disabled={isClaiming || localReward.isClaimed}
            className={cn(
              'relative overflow-hidden transition-all',
              localReward.isClaimed 
                ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' 
                : 'bg-primary/90 hover:bg-primary',
              !localReward.isClaimed && 'shadow-md hover:shadow-lg hover:shadow-primary/20'
            )}
          >
            {isClaiming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : localReward.isClaimed ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Claimed
              </>
            ) : (
              'Claim Reward'
            )}
            
            {!isClaiming && !localReward.isClaimed && (
              <motion.span 
                className="absolute inset-0 bg-white/20"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1, scale: 1.5 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
