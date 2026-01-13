import { readContract, writeContract, waitForTransaction } from '@wagmi/core';
import { config } from '@/config/wagmi';
import { REWARD_CONTRACT_ADDRESS, REWARD_CONTRACT_ABI } from '@/config/contracts';
import { Reward } from '@/types/reward';
import { BlockchainReward } from '@/types/blockchain';

export type RewardAssetType = 'ERC20' | 'ERC721' | 'ERC1155';

export interface AdminReward extends Reward {
  tokenAddress: string;
  assetType: RewardAssetType;
  idOrAmount: string;
  weight: number;
  isActive: boolean;
}

export interface AddRewardParams {
  assetType: RewardAssetType;
  tokenAddress: string;
  idOrAmount: string;
  weight: number;
  name: string;
  description: string;
  image?: string;
}

export interface EditRewardParams {
  id: string;
  weight?: number;
  stock?: number;
}

/**
 * Fetch all rewards with admin-specific details
 */
export async function fetchAdminRewards(): Promise<AdminReward[]> {
  try {
    const [allRewards, weights] = await Promise.all([
      readContract(config, {
        address: REWARD_CONTRACT_ADDRESS,
        abi: REWARD_CONTRACT_ABI,
        functionName: 'getAllRewards',
      }),
      readContract(config, {
        address: REWARD_CONTRACT_ADDRESS,
        abi: REWARD_CONTRACT_ABI,
        functionName: 'getWeights',
      }),
    ]);

    const rewards: AdminReward[] = [];
    const totalWeight = weights.length > 0 ? weights[weights.length - 1] : 0;

    for (let i = 0; i < allRewards.length; i++) {
      const reward = allRewards[i] as BlockchainReward;
      const weight = i < weights.length ? (i === 0 ? weights[0] : weights[i] - weights[i - 1]) : 0;
      const probability = totalWeight > 0 ? Number(weight) / Number(totalWeight) : 0;

      const rewardData = await mapBlockchainRewardToAdmin(reward, i, probability, Number(weight));
      rewards.push(rewardData);
    }

    return rewards;
  } catch (error) {
    console.error('Error fetching admin rewards:', error);
    throw new Error('Failed to fetch rewards from smart contract');
  }
}

async function mapBlockchainRewardToAdmin(
  blockchainReward: BlockchainReward,
  index: number,
  probability: number,
  weight: number
): Promise<AdminReward> {
  const { assetType, token, idOrAmount } = blockchainReward;

  let name = 'Unknown Reward';
  let description = 'A reward from the blockchain';
  let image = 'https://picsum.photos/seed/default/400/400';
  let type: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
  let assetTypeName: RewardAssetType = 'ERC20';

  // Determine asset type
  if (assetType === 1) {
    assetTypeName = 'ERC20';
    name = `${Number(idOrAmount) / 1e18} Tokens`;
    description = 'ERC20 tokens';
  } else if (assetType === 2) {
    assetTypeName = 'ERC721';
    name = `NFT #${idOrAmount}`;
    description = 'Unique NFT collectible';
  } else if (assetType === 3) {
    assetTypeName = 'ERC1155';
    name = `Item #${idOrAmount}`;
    description = 'Semi-fungible token';
  }

  // Determine tier based on probability
  if (probability >= 0.4) {
    type = 'common';
  } else if (probability >= 0.2) {
    type = 'rare';
  } else if (probability >= 0.05) {
    type = 'epic';
  } else {
    type = 'legendary';
  }

  // Get remaining stock
  let remaining = 0;
  try {
    const stock = await readContract(config, {
      address: REWARD_CONTRACT_ADDRESS,
      abi: REWARD_CONTRACT_ABI,
      functionName: 'getRewardStock',
      args: [token, BigInt(idOrAmount)],
    });
    remaining = Number(stock);
  } catch (error) {
    console.warn('Could not fetch reward stock:', error);
  }

  return {
    id: index.toString(),
    name,
    description,
    image,
    probability,
    remaining,
    total: remaining,
    type,
    tokenAddress: token,
    assetType: assetTypeName,
    idOrAmount: idOrAmount.toString(),
    weight,
    isActive: remaining > 0,
  };
}

/**
 * Add a new reward to the contract
 * Note: This requires admin functions to be added to the contract
 */
export async function addReward(params: AddRewardParams): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implement contract call when admin functions are available
    // For now, this is a placeholder
    console.log('Adding reward:', params);
    throw new Error('Admin functions not yet implemented in contract');
  } catch (error: any) {
    console.error('Error adding reward:', error);
    return {
      success: false,
      error: error.message || 'Failed to add reward',
    };
  }
}

/**
 * Update an existing reward
 */
export async function updateReward(params: EditRewardParams): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implement contract call when admin functions are available
    console.log('Updating reward:', params);
    throw new Error('Admin functions not yet implemented in contract');
  } catch (error: any) {
    console.error('Error updating reward:', error);
    return {
      success: false,
      error: error.message || 'Failed to update reward',
    };
  }
}

/**
 * Delete/disable a reward
 */
export async function deleteReward(rewardId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implement contract call when admin functions are available
    console.log('Deleting reward:', rewardId);
    throw new Error('Admin functions not yet implemented in contract');
  } catch (error: any) {
    console.error('Error deleting reward:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete reward',
    };
  }
}

/**
 * Refill reward stock
 */
export async function refillRewardStock(rewardId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implement contract call when admin functions are available
    console.log('Refilling reward stock:', { rewardId, amount });
    throw new Error('Admin functions not yet implemented in contract');
  } catch (error: any) {
    console.error('Error refilling reward stock:', error);
    return {
      success: false,
      error: error.message || 'Failed to refill reward stock',
    };
  }
}
