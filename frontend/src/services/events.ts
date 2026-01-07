import { createPublicClient, http, parseAbiItem } from 'viem';
import { liskSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { RewardHistory, TransactionRecord } from '@/types/dashboard';

const publicClient = createPublicClient({
  chain: liskSepolia,
  transport: http(),
});

export class EventService {
  static async getRewardOpenEvents(userAddress: `0x${string}`): Promise<RewardHistory[]> {
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.SmetReward,
        event: parseAbiItem('event RewardOpened(address indexed user, uint256 rewardType, uint256 amount, uint256 tokenId)'),
        args: { user: userAddress },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      return logs.map((log, index) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        timestamp: Date.now() / 1000 - (logs.length - index) * 3600,
        rewardType: log.args.rewardType === 0n ? 'SmetGold' : 
                   log.args.rewardType === 1n ? 'SmetHero' : 'SmetLoot',
        amount: log.args.amount?.toString() || '0',
        tokenId: log.args.tokenId?.toString(),
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
      }));
    } catch (error) {
      console.error('Error fetching reward events:', error);
      return [];
    }
  }

  static async getTransactionHistory(userAddress: `0x${string}`): Promise<TransactionRecord[]> {
    try {
      const mockTransactions: TransactionRecord[] = [
        {
          hash: '0x1234567890abcdef1234567890abcdef12345678',
          timestamp: Date.now() / 1000 - 3600,
          type: 'reward_open',
          status: 'success',
          gasUsed: '21000',
          gasPrice: '20000000000',
        },
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef12',
          timestamp: Date.now() / 1000 - 7200,
          type: 'token_transfer',
          status: 'success',
          gasUsed: '65000',
          gasPrice: '25000000000',
          value: '1000000000000000000',
        },
      ];

      return mockTransactions;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }
}