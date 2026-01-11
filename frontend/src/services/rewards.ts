import { readContract, writeContract, waitForTransaction } from '@wagmi/core';
import { config } from '@/config/wagmi';
import { REWARD_CONTRACT_ADDRESS, REWARD_CONTRACT_ABI, CONTRACT_ADDRESSES } from '@/config/contracts';
import { Reward } from '@/types/reward';
import { BlockchainReward, OpenRewardResult } from '@/types/blockchain';
import { parseEther } from 'viem';

export async function fetchRewards(): Promise<Reward[]> {
  try {
    const [allRewards, weights, fee] = await Promise.all([
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
      readContract(config, {
        address: REWARD_CONTRACT_ADDRESS,
        abi: REWARD_CONTRACT_ABI,
        functionName: 'fee',
      }),
    ]);

    const rewards: Reward[] = [];
    const totalWeight = weights.length > 0 ? weights[weights.length - 1] : 0;

    for (let i = 0; i < allRewards.length; i++) {
      const reward = allRewards[i] as BlockchainReward;
      const weight = i < weights.length ? (i === 0 ? weights[0] : weights[i] - weights[i - 1]) : 0;
      const probability = totalWeight > 0 ? Number(weight) / Number(totalWeight) : 0;

      const rewardData = await mapBlockchainRewardToUI(reward, i, probability);
      rewards.push(rewardData);
    }

    return rewards;
  } catch (error) {
    console.error('Error fetching rewards from blockchain:', error);
    throw new Error('Failed to fetch rewards from smart contract');
  }
}

export async function openReward(rewardId: string): Promise<OpenRewardResult> {
  try {
    const fee = await readContract(config, {
      address: REWARD_CONTRACT_ADDRESS,
      abi: REWARD_CONTRACT_ABI,
      functionName: 'fee',
    });

    const hash = await writeContract(config, {
      address: REWARD_CONTRACT_ADDRESS,
      abi: REWARD_CONTRACT_ABI,
      functionName: 'open',
      args: [true],
      value: fee,
    });

    const receipt = await waitForTransaction(config, { hash });

    if (receipt.status === 'success') {
      return {
        success: true,
        txHash: hash,
        reward: {
          name: `Reward Box #${rewardId}`,
          remaining: 0, // Will be updated by event listener
        },
      };
    } else {
      return {
        success: false,
        error: 'Transaction failed',
      };
    }
  } catch (error: any) {
    console.error('Error opening reward:', error);
    return {
      success: false,
      error: error.message || 'Failed to open reward box',
    };
  }
}

async function mapBlockchainRewardToUI(
  blockchainReward: BlockchainReward,
  index: number,
  probability: number
): Promise<Reward> {
  const { assetType, token, idOrAmount } = blockchainReward;
  
  let name = 'Unknown Reward';
  let description = 'A mysterious reward from the blockchain';
  let image = 'https://picsum.photos/seed/default/400/400';
  let type: 'common' | 'rare' | 'epic' | 'legendary' = 'common';

  // Determine reward type based on probability
  if (probability >= 0.4) {
    type = 'common';
    name = 'Common Reward';
    image = 'https://picsum.photos/seed/common/400/400';
  } else if (probability >= 0.2) {
    type = 'rare';
    name = 'Rare Reward';
    image = 'https://picsum.photos/seed/rare/400/400';
  } else if (probability >= 0.05) {
    type = 'epic';
    name = 'Epic Reward';
    image = 'https://picsum.photos/seed/epic/400/400';
  } else {
    type = 'legendary';
    name = 'Legendary Reward';
    image = 'https://picsum.photos/seed/legendary/400/400';
  }

  // Customize based on asset type
  if (assetType === 1) {
    // ERC20 Token
    if (token === CONTRACT_ADDRESSES.SmetGold) {
      name = `${Number(idOrAmount) / 1e18} SmetGold`;
      description = 'SmetGold tokens for in-game purchases';
    }
  } else if (assetType === 2) {
    // ERC721 NFT
    if (token === CONTRACT_ADDRESSES.SmetHero) {
      name = `Hero NFT #${idOrAmount}`;
      description = 'A unique hero character for your collection';
    }
  } else if (assetType === 3) {
    // ERC1155 Token
    if (token === CONTRACT_ADDRESSES.SmetLoot) {
      name = `Loot Item #${idOrAmount}`;
      description = 'A valuable loot item for your inventory';
    }
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
    total: remaining, // Assuming current stock is total for now
    type,
  };
}