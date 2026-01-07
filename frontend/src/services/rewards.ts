import { Reward } from '@/types/reward';

// Mock data for rewards
const MOCK_REWARDS: Reward[] = [
  {
    id: '1',
    name: 'Common NFT',
    description: 'A common collectible NFT with unique artwork',
    image: 'https://picsum.photos/seed/common/400/400',
    probability: 0.5,
    remaining: 45,
    total: 100,
    type: 'common',
  },
  {
    id: '2',
    name: 'Rare Collectible',
    description: 'A rare digital collectible with special attributes',
    image: 'https://picsum.photos/seed/rare/400/400',
    probability: 0.3,
    remaining: 20,
    total: 50,
    type: 'rare',
  },
  {
    id: '3',
    name: 'Epic Artwork',
    description: 'An epic piece of digital artwork for your collection',
    image: 'https://picsum.photos/seed/epic/400/400',
    probability: 0.15,
    remaining: 8,
    total: 20,
    type: 'epic',
  },
  {
    id: '4',
    name: 'Legendary Token',
    description: 'An extremely rare and valuable digital asset',
    image: 'https://picsum.photos/seed/legendary/400/400',
    probability: 0.05,
    remaining: 2,
    total: 5,
    type: 'legendary',
    availableAfter: Math.floor(Date.now()/1000) + 3600, // unlocks in 1h
  },
];

export async function fetchRewards(): Promise<Reward[]> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_REWARDS);
    }, 500);
  });
}

export async function openReward(rewardId: string): Promise<{ success: boolean; reward: Reward }> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const reward = MOCK_REWARDS.find(r => r.id === rewardId);
      if (reward && reward.remaining > 0) {
        reward.remaining -= 1;
        resolve({ success: true, reward });
      } else {
        // Fallback in case the reward is not found or out of stock
        resolve({ 
          success: false, 
          reward: MOCK_REWARDS[0] // Return first reward as fallback
        });
      }
    }, 1500); // Longer delay to simulate network request
  });
}
