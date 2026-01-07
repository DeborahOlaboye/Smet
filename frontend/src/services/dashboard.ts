import { readContract, readContracts } from '@wagmi/core';
import { config } from '@/config/wagmi';
import { CONTRACT_ADDRESSES, ERC20_ABI, ERC721_ABI, ERC1155_ABI } from '@/config/contracts';
import { RewardHistory, UserStats, OwnedAsset, TransactionRecord } from '@/types/dashboard';
import { EventService } from './events';
import { ErrorParser } from './errorParser';

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
      const rewardHistory = await EventService.getRewardOpenEvents(userAddress);
      
      return {
        totalSpent: '0',
        boxesOpened: rewardHistory.length,
        totalRewardsWon: rewardHistory.length,
        smetGoldBalance: results[0].result?.toString() || '0',
        heroesOwned: Number(results[1].result) || 0,
        lootItemsOwned: 0,
      };
    } catch (error) {
      const parsedError = ErrorParser.parseError(error, {
        operation: 'Fetch User Stats',
        contract: 'Multiple'
      });
      console.error('Error fetching user stats:', parsedError);
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
          const parsedError = ErrorParser.parseError(error, {
            operation: 'Fetch Hero NFT',
            contract: 'SmetHero'
          });
          console.error(`Error fetching hero ${i}:`, parsedError);
        }
      }

      return heroes;
    } catch (error) {
      const parsedError = ErrorParser.parseError(error, {
        operation: 'Fetch Owned Heroes',
        contract: 'SmetHero'
      });
      console.error('Error fetching owned heroes:', parsedError);
      return [];
    }
  }

  static async getRewardHistory(userAddress: `0x${string}`): Promise<RewardHistory[]> {
    try {
      return await EventService.getRewardOpenEvents(userAddress);
    } catch (error) {
      console.error('Error fetching reward history:', error);
      return [];
    }
  }

  static async getTransactionHistory(userAddress: `0x${string}`): Promise<TransactionRecord[]> {
    try {
      return await EventService.getTransactionHistory(userAddress);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }
}