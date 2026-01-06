export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  probability: number;
  remaining: number;
  total: number;
  type: 'common' | 'rare' | 'epic' | 'legendary';
  // Optional client-side availability timestamp (Unix seconds)
  availableAfter?: number;
}

export const rewardTypes = {
  common: {
    name: 'Common',
    color: 'bg-gray-200 text-gray-800',
    border: 'border-gray-300',
  },
  rare: {
    name: 'Rare',
    color: 'bg-blue-100 text-blue-800',
    border: 'border-blue-300',
  },
  epic: {
    name: 'Epic',
    color: 'bg-purple-100 text-purple-800',
    border: 'border-purple-300',
  },
  legendary: {
    name: 'Legendary',
    color: 'bg-yellow-100 text-yellow-800',
    border: 'border-yellow-300',
  },
} as const;
