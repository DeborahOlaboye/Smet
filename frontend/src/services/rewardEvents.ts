import { createPublicClient, http, parseAbiItem } from 'viem';
import { liskSepolia } from 'viem/chains';
import { REWARD_CONTRACT_ADDRESS } from '@/config/contracts';

const publicClient = createPublicClient({
  chain: liskSepolia,
  transport: http(),
});

export class RewardEventService {
  static async getRewardOpenedEvents(userAddress?: `0x${string}`, fromBlock: bigint = 0n) {
    try {
      const logs = await publicClient.getLogs({
        address: REWARD_CONTRACT_ADDRESS,
        event: parseAbiItem('event Opened(address indexed opener, uint256 indexed reqId)'),
        args: userAddress ? { opener: userAddress } : undefined,
        fromBlock,
        toBlock: 'latest',
      });

      return logs.map(log => ({
        opener: log.args.opener,
        requestId: log.args.reqId?.toString(),
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
      }));
    } catch (error) {
      console.error('Error fetching Opened events:', error);
      return [];
    }
  }

  static async getRewardOutEvents(userAddress?: `0x${string}`, fromBlock: bigint = 0n) {
    try {
      const logs = await publicClient.getLogs({
        address: REWARD_CONTRACT_ADDRESS,
        event: parseAbiItem('event RewardOut(address indexed opener, tuple(uint8 assetType, address token, uint256 idOrAmount) reward)'),
        args: userAddress ? { opener: userAddress } : undefined,
        fromBlock,
        toBlock: 'latest',
      });

      return logs.map(log => ({
        opener: log.args.opener,
        reward: log.args.reward,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
      }));
    } catch (error) {
      console.error('Error fetching RewardOut events:', error);
      return [];
    }
  }

  static async subscribeToRewardEvents(
    onOpened: (event: any) => void,
    onRewardOut: (event: any) => void
  ) {
    try {
      // Subscribe to Opened events
      const unsubscribeOpened = publicClient.watchEvent({
        address: REWARD_CONTRACT_ADDRESS,
        event: parseAbiItem('event Opened(address indexed opener, uint256 indexed reqId)'),
        onLogs: (logs) => {
          logs.forEach(log => {
            onOpened({
              opener: log.args.opener,
              requestId: log.args.reqId?.toString(),
              transactionHash: log.transactionHash,
            });
          });
        },
      });

      // Subscribe to RewardOut events
      const unsubscribeRewardOut = publicClient.watchEvent({
        address: REWARD_CONTRACT_ADDRESS,
        event: parseAbiItem('event RewardOut(address indexed opener, tuple(uint8 assetType, address token, uint256 idOrAmount) reward)'),
        onLogs: (logs) => {
          logs.forEach(log => {
            onRewardOut({
              opener: log.args.opener,
              reward: log.args.reward,
              transactionHash: log.transactionHash,
            });
          });
        },
      });

      return () => {
        unsubscribeOpened();
        unsubscribeRewardOut();
      };
    } catch (error) {
      console.error('Error subscribing to events:', error);
      return () => {};
    }
  }
}