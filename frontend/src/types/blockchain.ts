export interface BlockchainReward {
  assetType: number;
  token: string;
  idOrAmount: string;
}

export interface RewardWithMetadata {
  id: string;
  name: string;
  description: string;
  image: string;
  probability: number;
  remaining: number;
  total: number;
  type: 'common' | 'rare' | 'epic' | 'legendary';
  blockchainData: BlockchainReward;
}

export interface OpenRewardResult {
  success: boolean;
  txHash?: string;
  reward?: {
    name: string;
    remaining: number;
  };
  error?: string;
}