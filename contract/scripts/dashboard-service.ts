import { ethers } from "hardhat";
import { SmetEventMonitor, EventData } from "./event-monitor";

interface DashboardMetrics {
  totalRewards: number;
  totalTransfers: number;
  activeUsers: number;
  totalVolume: string;
  recentActivity: EventData[];
  topUsers: { address: string; count: number }[];
  hourlyStats: { hour: number; events: number }[];
}

interface ContractStats {
  name: string;
  address: string;
  totalEvents: number;
  lastActivity: number;
  eventBreakdown: Record<string, number>;
}

class DashboardService {
  private monitor: SmetEventMonitor;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 300000; // 5 minutes

  constructor(provider: ethers.Provider) {
    this.monitor = new SmetEventMonitor(provider);
  }

  async initialize(): Promise<void> {
    await this.monitor.setupContracts();
  }

  async getMetrics(hours: number = 24): Promise<DashboardMetrics> {
    const cacheKey = `metrics_${hours}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const fromTimestamp = Math.floor(Date.now() / 1000) - (hours * 3600);
    
    // Get all events from the time period
    const allEvents = await this.getAllEvents(fromTimestamp);
    
    const metrics: DashboardMetrics = {
      totalRewards: this.countEventType(allEvents, "RewardOut"),
      totalTransfers: this.countEventType(allEvents, "Transfer"),
      activeUsers: this.getUniqueUsers(allEvents).length,
      totalVolume: this.calculateVolume(allEvents),
      recentActivity: allEvents.slice(-10), // Last 10 events
      topUsers: this.getTopUsers(allEvents),
      hourlyStats: this.getHourlyStats(allEvents, hours)
    };

    this.setCache(cacheKey, metrics);
    return metrics;
  }

  async getContractStats(): Promise<ContractStats[]> {
    const cacheKey = "contract_stats";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const contracts = ["SmetReward", "SmetGold", "SmetHero", "SmetLoot"];
    const stats: ContractStats[] = [];

    for (const contractName of contracts) {
      try {
        const events = await this.monitor.getHistoricalEvents(contractName, "*", 0);
        
        const eventBreakdown: Record<string, number> = {};
        let lastActivity = 0;

        events.forEach(event => {
          eventBreakdown[event.event] = (eventBreakdown[event.event] || 0) + 1;
          lastActivity = Math.max(lastActivity, event.timestamp);
        });

        stats.push({
          name: contractName,
          address: this.getContractAddress(contractName),
          totalEvents: events.length,
          lastActivity,
          eventBreakdown
        });

      } catch (error) {
        console.error(`Error getting stats for ${contractName}:`, error);
      }
    }

    this.setCache(cacheKey, stats);
    return stats;
  }

  async getRewardAnalytics(): Promise<any> {
    const cacheKey = "reward_analytics";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const rewardEvents = await this.monitor.getHistoricalEvents("SmetReward", "RewardOut", 0);
      
      const analytics = {
        totalRewards: rewardEvents.length,
        rewardTypes: this.analyzeRewardTypes(rewardEvents),
        dailyDistribution: this.getDailyDistribution(rewardEvents),
        averageRewardsPerDay: this.getAverageRewardsPerDay(rewardEvents),
        topRecipients: this.getTopRecipients(rewardEvents)
      };

      this.setCache(cacheKey, analytics);
      return analytics;

    } catch (error) {
      console.error("Error getting reward analytics:", error);
      return null;
    }
  }

  async getTransactionHealth(): Promise<any> {
    const cacheKey = "tx_health";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const last24h = Math.floor(Date.now() / 1000) - 86400;
    const allEvents = await this.getAllEvents(last24h);

    const health = {
      totalTransactions: allEvents.length,
      successRate: 100, // Assume all events are successful
      averageBlockTime: await this.getAverageBlockTime(allEvents),
      gasUsage: await this.estimateGasUsage(allEvents),
      networkStatus: "healthy" // Simplified
    };

    this.setCache(cacheKey, health);
    return health;
  }

  private async getAllEvents(fromTimestamp: number): Promise<EventData[]> {
    const contracts = ["SmetReward", "SmetGold", "SmetHero", "SmetLoot"];
    const allEvents: EventData[] = [];

    for (const contractName of contracts) {
      try {
        const events = await this.monitor.getHistoricalEvents(contractName, "*", fromTimestamp);
        allEvents.push(...events);
      } catch (error) {
        console.error(`Error fetching events for ${contractName}:`, error);
      }
    }

    return allEvents.sort((a, b) => a.timestamp - b.timestamp);
  }

  private countEventType(events: EventData[], eventType: string): number {
    return events.filter(e => e.event === eventType).length;
  }

  private getUniqueUsers(events: EventData[]): string[] {
    const users = new Set<string>();
    
    events.forEach(event => {
      // Extract user addresses from different event types
      if (event.args.opener) users.add(event.args.opener);
      if (event.args.from && event.args.from !== ethers.ZeroAddress) users.add(event.args.from);
      if (event.args.to && event.args.to !== ethers.ZeroAddress) users.add(event.args.to);
    });

    return Array.from(users);
  }

  private calculateVolume(events: EventData[]): string {
    let totalVolume = 0n;
    
    events.forEach(event => {
      if (event.event === "Transfer" && event.args.value) {
        totalVolume += BigInt(event.args.value.toString());
      }
    });

    return ethers.formatEther(totalVolume);
  }

  private getTopUsers(events: EventData[]): { address: string; count: number }[] {
    const userCounts = new Map<string, number>();
    
    events.forEach(event => {
      if (event.args.opener) {
        userCounts.set(event.args.opener, (userCounts.get(event.args.opener) || 0) + 1);
      }
    });

    return Array.from(userCounts.entries())
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getHourlyStats(events: EventData[], hours: number): { hour: number; events: number }[] {
    const stats: { hour: number; events: number }[] = [];
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 0; i < hours; i++) {
      const hourStart = now - ((i + 1) * 3600);
      const hourEnd = now - (i * 3600);
      
      const eventsInHour = events.filter(e => 
        e.timestamp >= hourStart && e.timestamp < hourEnd
      ).length;
      
      stats.unshift({ hour: i, events: eventsInHour });
    }
    
    return stats;
  }

  private analyzeRewardTypes(events: EventData[]): Record<string, number> {
    const types: Record<string, number> = {};
    
    events.forEach(event => {
      const assetType = event.args.reward?.assetType || 0;
      const typeKey = `Type_${assetType}`;
      types[typeKey] = (types[typeKey] || 0) + 1;
    });
    
    return types;
  }

  private getDailyDistribution(events: EventData[]): { date: string; count: number }[] {
    const daily = new Map<string, number>();
    
    events.forEach(event => {
      const date = new Date(event.timestamp * 1000).toISOString().split('T')[0];
      daily.set(date, (daily.get(date) || 0) + 1);
    });
    
    return Array.from(daily.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getAverageRewardsPerDay(events: EventData[]): number {
    if (events.length === 0) return 0;
    
    const firstEvent = events[0].timestamp;
    const lastEvent = events[events.length - 1].timestamp;
    const days = Math.max(1, (lastEvent - firstEvent) / 86400);
    
    return events.length / days;
  }

  private getTopRecipients(events: EventData[]): { address: string; count: number }[] {
    const recipients = new Map<string, number>();
    
    events.forEach(event => {
      if (event.args.opener) {
        recipients.set(event.args.opener, (recipients.get(event.args.opener) || 0) + 1);
      }
    });
    
    return Array.from(recipients.entries())
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async getAverageBlockTime(events: EventData[]): Promise<number> {
    if (events.length < 2) return 0;
    
    const blocks = events.map(e => e.blockNumber).sort((a, b) => a - b);
    const timeSpan = events[events.length - 1].timestamp - events[0].timestamp;
    const blockSpan = blocks[blocks.length - 1] - blocks[0];
    
    return blockSpan > 0 ? timeSpan / blockSpan : 0;
  }

  private async estimateGasUsage(events: EventData[]): Promise<string> {
    // Simplified gas estimation
    return (events.length * 50000).toString(); // Rough estimate
  }

  private getContractAddress(contractName: string): string {
    const addresses: Record<string, string> = {
      "SmetReward": "0xeF85822c30D194c2B2F7cC17223C64292Bfe611b",
      "SmetGold": "0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2",
      "SmetHero": "0x877D1FDa6a6b668b79ca4A42388E0825667d233E",
      "SmetLoot": "0xa5046538c6338DC8b52a22675338a4623D4B5475"
    };
    return addresses[contractName] || "";
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

export { DashboardService, DashboardMetrics, ContractStats };