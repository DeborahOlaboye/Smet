import { readContract, readContracts } from '@wagmi/core';
import { config } from '@/config/wagmi';
import { CONTRACT_ADDRESSES, ERC20_ABI, ERC721_ABI, ERC1155_ABI } from '@/config/contracts';
import { RewardHistory, UserStats, OwnedAsset, TransactionRecord } from '@/types/dashboard';

export class DashboardService {
  static async getUserStats(userAddress: `0x${string}`): Promise<UserStats> {
    try {
      const contracts = [
        {
          address: CONTRACT_ADDRESSES.SmetGold,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [userAddress],
        },
        {
          address: CONTRACT_ADDRESSES.SmetHero,
          abi: ERC721_ABI,
          functionName: 'balanceOf',
          args: [userAddress],
        },
      ];

      const results = await readContracts(config, { contracts });
      
      return {
        totalSpent: '0',
        boxesOpened: 0,
        totalRewardsWon: 0,
        smetGoldBalance: results[0].result?.toString() || '0',
        heroesOwned: Number(results[1].result) || 0,
        lootItemsOwned: 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  static async getOwnedHeroes(userAddress: `0x${string}`): Promise<OwnedAsset[]> {
    try {
      const balance = await readContract(config, {
        address: CONTRACT_ADDRESSES.SmetHero,
        abi: ERC721_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      });

      const heroCount = Number(balance);
      const heroes: OwnedAsset[] = [];

      for (let i = 0; i < heroCount; i++) {
        try {
          const tokenId = await readContract(config, {
            address: CONTRACT_ADDRESSES.SmetHero,
            abi: ERC721_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [userAddress, BigInt(i)],
          });

          const tokenURI = await readContract(config, {
            address: CONTRACT_ADDRESSES.SmetHero,
            abi: ERC721_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          });

          const metadata = await fetch(tokenURI as string).then(res => res.json());
          
          heroes.push({
            type: 'hero',
            tokenId: tokenId.toString(),
            name: metadata.name || `Hero #${tokenId}`,
            image: metadata.image || '',
            description: metadata.description || '',
            attributes: metadata.attributes || [],
          });
        } catch (error) {
          console.error(`Error fetching hero ${i}:`, error);
        }
      }

      return heroes;
    } catch (error) {
      console.error('Error fetching owned heroes:', error);
      return [];
    }
  }

  static async getRewardHistory(userAddress: `0x${string}`): Promise<RewardHistory[]> {
    // This would typically fetch from blockchain events or a backend service
    // For now, returning mock data
    return [];
  }

  static async getTransactionHistory(userAddress: `0x${string}`): Promise<TransactionRecord[]> {
    // This would typically fetch from blockchain or indexing service
    // For now, returning mock data
    return [];
  }
}