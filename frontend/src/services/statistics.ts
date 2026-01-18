import { createPublicClient, http, parseAbiItem, getContract } from 'viem';
import { liskSepolia } from 'viem/chains';
import { REWARD_CONTRACT_ADDRESS } from '@/config/contracts';

const publicClient = createPublicClient({
  chain: liskSepolia,
  transport: http(),
});

export interface BoxOpenedEvent {
  opener: string;
  requestId: string;
  blockNumber: number;
  timestamp: number;
}

export interface RewardOutEvent {
  opener: string;
  tokenType: number;
  tokenAddress: string;
  amount: number;
  blockNumber: number;
  timestamp: number;
}

export interface StatisticsData {
  totalBoxesOpened: number;
  totalFeesCollected: bigint;
  uniqueUsers: number;
  rewardDistribution: Record<string, number>;
  mostPopularRewards: Array<{
    token: string;
    count: number;
    percentage: number;
  }>;
  userEngagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageClaimsPerUser: number;
  };
  dailyStats: Array<{
    date: string;
    boxesOpened: number;
    feesCollected: number;
  }>;
  weeklyStats: Array<{
    week: string;
    boxesOpened: number;
    feesCollected: number;
  }>;
  monthlyStats: Array<{
    month: string;
    boxesOpened: number;
    feesCollected: number;
  }>;
}

export class StatisticsService {
  static async getOpenedEvents(fromBlock: bigint = 0n) {
    try {
      const logs = await publicClient.getLogs({
        address: REWARD_CONTRACT_ADDRESS,
        event: parseAbiItem('event Opened(address indexed opener, uint256 indexed reqId)'),
        fromBlock,
        toBlock: 'latest',
      });

      const eventsWithTimestamps = await Promise.all(
        logs.map(async (log) => {
          const block = await publicClient.getBlock({
            blockNumber: log.blockNumber,
          });
          return {
            opener: log.args.opener,
            requestId: log.args.reqId?.toString() || '',
            blockNumber: Number(log.blockNumber),
            timestamp: Number(block.timestamp),
          };
        })
      );

      return eventsWithTimestamps;
    } catch (error) {
      console.error('Error fetching Opened events:', error);
      return [];
    }
  }

  static async getRewardOutEvents(fromBlock: bigint = 0n) {
    try {
      const logs = await publicClient.getLogs({
        address: REWARD_CONTRACT_ADDRESS,
        event: parseAbiItem(
          'event RewardOut(address indexed opener, tuple(uint8 assetType, address token, uint256 idOrAmount) reward)'
        ),
        fromBlock,
        toBlock: 'latest',
      });

      const eventsWithTimestamps = await Promise.all(
        logs.map(async (log) => {
          const block = await publicClient.getBlock({
            blockNumber: log.blockNumber,
          });
          return {
            opener: log.args.opener,
            tokenType: log.args.reward?.assetType || 0,
            tokenAddress: log.args.reward?.token || '',
            amount: Number(log.args.reward?.idOrAmount || 0),
            blockNumber: Number(log.blockNumber),
            timestamp: Number(block.timestamp),
          };
        })
      );

      return eventsWithTimestamps;
    } catch (error) {
      console.error('Error fetching RewardOut events:', error);
      return [];
    }
  }

  static async getTotalFeesCollected() {
    try {
      const logs = await publicClient.getLogs({
        address: REWARD_CONTRACT_ADDRESS,
        event: parseAbiItem('event Opened(address indexed opener, uint256 indexed reqId)'),
        fromBlock: 0n,
        toBlock: 'latest',
      });

      const totalCount = logs.length;
      const FEE_AMOUNT = BigInt(1000000000000000); // 0.001 ETH in wei
      return totalCount * FEE_AMOUNT;
    } catch (error) {
      console.error('Error calculating fees:', error);
      return BigInt(0);
    }
  }

  static async getStatistics(): Promise<StatisticsData> {
    try {
      const openedEvents = await this.getOpenedEvents();
      const rewardOutEvents = await this.getRewardOutEvents();
      const totalFees = await this.getTotalFeesCollected();

      const uniqueOpeners = new Set(openedEvents.map((e) => e.opener));
      const uniqueClaimers = new Set(rewardOutEvents.map((e) => e.opener));

      // Calculate reward distribution
      const rewardDistribution: Record<string, number> = {};
      rewardOutEvents.forEach((event) => {
        const key = `${event.tokenType}-${event.tokenAddress}`;
        rewardDistribution[key] = (rewardDistribution[key] || 0) + 1;
      });

      // Most popular rewards
      const mostPopularRewards = Object.entries(rewardDistribution)
        .map(([token, count]) => ({
          token,
          count,
          percentage: (count / rewardOutEvents.length) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // User engagement metrics
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

      const dailyActiveUsers = new Set(
        openedEvents
          .filter((e) => e.timestamp * 1000 > oneDayAgo)
          .map((e) => e.opener)
      ).size;

      const weeklyActiveUsers = new Set(
        openedEvents
          .filter((e) => e.timestamp * 1000 > oneWeekAgo)
          .map((e) => e.opener)
      ).size;

      const monthlyActiveUsers = new Set(
        openedEvents
          .filter((e) => e.timestamp * 1000 > oneMonthAgo)
          .map((e) => e.opener)
      ).size;

      const averageClaimsPerUser =
        rewardOutEvents.length / Math.max(1, uniqueClaimers.size);

      // Time-based stats
      const dailyStats = this.calculateDailyStats(openedEvents);
      const weeklyStats = this.calculateWeeklyStats(openedEvents);
      const monthlyStats = this.calculateMonthlyStats(openedEvents);

      return {
        totalBoxesOpened: openedEvents.length,
        totalFeesCollected: totalFees,
        uniqueUsers: uniqueOpeners.size,
        rewardDistribution,
        mostPopularRewards,
        userEngagementMetrics: {
          dailyActiveUsers,
          weeklyActiveUsers,
          monthlyActiveUsers,
          averageClaimsPerUser,
        },
        dailyStats,
        weeklyStats,
        monthlyStats,
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalBoxesOpened: 0,
        totalFeesCollected: BigInt(0),
        uniqueUsers: 0,
        rewardDistribution: {},
        mostPopularRewards: [],
        userEngagementMetrics: {
          dailyActiveUsers: 0,
          weeklyActiveUsers: 0,
          monthlyActiveUsers: 0,
          averageClaimsPerUser: 0,
        },
        dailyStats: [],
        weeklyStats: [],
        monthlyStats: [],
      };
    }
  }

  private static calculateDailyStats(
    events: BoxOpenedEvent[]
  ): Array<{ date: string; boxesOpened: number; feesCollected: number }> {
    const stats: Record<string, number> = {};

    events.forEach((event) => {
      const date = new Date(event.timestamp * 1000);
      const dateKey = date.toISOString().split('T')[0];
      stats[dateKey] = (stats[dateKey] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([date, count]) => ({
        date,
        boxesOpened: count,
        feesCollected: count * 0.001,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }

  private static calculateWeeklyStats(
    events: BoxOpenedEvent[]
  ): Array<{ week: string; boxesOpened: number; feesCollected: number }> {
    const stats: Record<string, number> = {};

    events.forEach((event) => {
      const date = new Date(event.timestamp * 1000);
      const week = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
      stats[week] = (stats[week] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([week, count]) => ({
        week,
        boxesOpened: count,
        feesCollected: count * 0.001,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12);
  }

  private static calculateMonthlyStats(
    events: BoxOpenedEvent[]
  ): Array<{ month: string; boxesOpened: number; feesCollected: number }> {
    const stats: Record<string, number> = {};

    events.forEach((event) => {
      const date = new Date(event.timestamp * 1000);
      const month = date.toISOString().substring(0, 7);
      stats[month] = (stats[month] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([month, count]) => ({
        month,
        boxesOpened: count,
        feesCollected: count * 0.001,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }

  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
