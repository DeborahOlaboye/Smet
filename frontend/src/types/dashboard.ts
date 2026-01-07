export interface RewardHistory {
  id: string;
  timestamp: number;
  rewardType: 'SmetGold' | 'SmetHero' | 'SmetLoot';
  amount: string;
  tokenId?: string;
  transactionHash: string;
  blockNumber: number;
}

export interface UserStats {
  totalSpent: string;
  boxesOpened: number;
  totalRewardsWon: number;
  smetGoldBalance: string;
  heroesOwned: number;
  lootItemsOwned: number;
}

export interface OwnedAsset {
  type: 'hero' | 'loot';
  tokenId: string;
  name: string;
  image: string;
  description: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface TransactionRecord {
  hash: string;
  timestamp: number;
  type: 'reward_open' | 'token_transfer' | 'nft_transfer';
  status: 'success' | 'failed' | 'pending';
  gasUsed?: string;
  gasPrice?: string;
  value?: string;
}