import { ethers } from "hardhat";
import { SmetEventMonitor } from "./event-monitor";

interface AlertConfig {
  eventName: string;
  condition?: (args: any) => boolean;
  action: (event: any) => void;
}

class RealTimeMonitor {
  private monitor: SmetEventMonitor;
  private alerts: AlertConfig[] = [];

  constructor(provider: ethers.Provider) {
    this.monitor = new SmetEventMonitor(provider);
    this.setupAlerts();
  }

  private setupAlerts(): void {
    // Large transfer alert
    this.addAlert({
      eventName: "Transfer",
      condition: (args) => {
        const amount = ethers.formatEther(args.value || "0");
        return parseFloat(amount) > 1000; // Alert for transfers > 1000 tokens
      },
      action: (event) => {
        console.log(`🚨 LARGE TRANSFER ALERT: ${ethers.formatEther(event.args.value)} tokens`);
        this.sendAlert("Large Transfer", event);
      }
    });

    // Pause alert
    this.addAlert({
      eventName: "Paused",
      action: (event) => {
        console.log(`🚨 CONTRACT PAUSED: ${event.contract}`);
        this.sendAlert("Contract Paused", event);
      }
    });

    // Failed transaction alert (if we can detect)
    this.addAlert({
      eventName: "RewardOut",
      condition: (args) => args.reward.assetType === 0, // Invalid asset type
      action: (event) => {
        console.log(`🚨 INVALID REWARD: ${event.transactionHash}`);
        this.sendAlert("Invalid Reward", event);
      }
    });

    // High frequency activity
    this.setupFrequencyMonitoring();
  }

  private addAlert(config: AlertConfig): void {
    this.alerts.push(config);
    
    this.monitor.onEvent(config.eventName, (event) => {
      if (!config.condition || config.condition(event.args)) {
        config.action(event);
      }
    });
  }

  private setupFrequencyMonitoring(): void {
    const eventCounts = new Map<string, number>();
    const timeWindow = 60000; // 1 minute

    setInterval(() => {
      for (const [eventType, count] of eventCounts) {
        if (count > 10) { // More than 10 events per minute
          console.log(`🚨 HIGH FREQUENCY ALERT: ${eventType} - ${count} events in last minute`);
          this.sendAlert("High Frequency", { eventType, count });
        }
      }
      eventCounts.clear();
    }, timeWindow);

    this.monitor.onEvent("*", (event) => {
      const key = `${event.contract}.${event.event}`;
      eventCounts.set(key, (eventCounts.get(key) || 0) + 1);
    });
  }

  private sendAlert(type: string, data: any): void {
    // In production, this would send to Discord, Slack, email, etc.
    console.log(`📧 Alert sent: ${type}`, data);
    
    // Example webhook call (commented out)
    // await fetch(process.env.WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type, data, timestamp: Date.now() })
    // });
  }

  async start(): Promise<void> {
    await this.monitor.setupContracts();
    await this.monitor.startMonitoring();
    console.log("🚀 Real-time monitoring started");
  }

  stop(): void {
    this.monitor.stopMonitoring();
    console.log("⏹️ Real-time monitoring stopped");
  }
}

// Analytics and reporting
class EventAnalytics {
  private monitor: SmetEventMonitor;

  constructor(provider: ethers.Provider) {
    this.monitor = new SmetEventMonitor(provider);
  }

  async generateDailyReport(): Promise<void> {
    console.log("📊 Generating daily report...");
    
    const yesterday = Math.floor(Date.now() / 1000) - 86400;
    const today = Math.floor(Date.now() / 1000);

    await this.monitor.setupContracts();

    // Get events from last 24 hours
    const contracts = ["SmetReward", "SmetGold", "SmetHero", "SmetLoot"];
    
    for (const contractName of contracts) {
      console.log(`\n📋 ${contractName} Activity:`);
      
      try {
        // Reward events
        if (contractName === "SmetReward") {
          const opens = await this.monitor.getHistoricalEvents(contractName, "Opened", yesterday);
          const rewards = await this.monitor.getHistoricalEvents(contractName, "RewardOut", yesterday);
          
          console.log(`  🎲 Boxes opened: ${opens.length}`);
          console.log(`  🎁 Rewards distributed: ${rewards.length}`);
        }

        // Transfer events
        const transfers = await this.monitor.getHistoricalEvents(contractName, "Transfer", yesterday);
        console.log(`  💸 Transfers: ${transfers.length}`);

      } catch (error) {
        console.log(`  ❌ Error fetching events: ${error}`);
      }
    }
  }

  async getTopUsers(days: number = 7): Promise<void> {
    console.log(`👥 Top users (last ${days} days):`);
    
    const fromBlock = Math.floor(Date.now() / 1000) - (days * 86400);
    
    await this.monitor.setupContracts();
    
    try {
      const opens = await this.monitor.getHistoricalEvents("SmetReward", "Opened", fromBlock);
      
      const userCounts = new Map<string, number>();
      opens.forEach(event => {
        const user = event.args.opener;
        userCounts.set(user, (userCounts.get(user) || 0) + 1);
      });

      const sorted = Array.from(userCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      sorted.forEach(([user, count], index) => {
        console.log(`  ${index + 1}. ${user}: ${count} boxes opened`);
      });

    } catch (error) {
      console.log(`❌ Error generating user stats: ${error}`);
    }
  }
}

// Main monitoring application
async function startMonitoring() {
  const provider = ethers.provider;
  const monitor = new RealTimeMonitor(provider);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down monitor...');
    monitor.stop();
    process.exit(0);
  });

  await monitor.start();
  
  // Keep the process running
  console.log('📡 Monitoring active. Press Ctrl+C to stop.');
}

async function generateReports() {
  const provider = ethers.provider;
  const analytics = new EventAnalytics(provider);
  
  await analytics.generateDailyReport();
  await analytics.getTopUsers();
}

// Export for use in other scripts
export { RealTimeMonitor, EventAnalytics };

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "start":
      startMonitoring().catch(console.error);
      break;
    case "report":
      generateReports()
        .then(() => process.exit(0))
        .catch(console.error);
      break;
    default:
      console.log(`
Event Monitor CLI

Usage: npx ts-node real-time-monitor.ts [command]

Commands:
  start    Start real-time event monitoring
  report   Generate analytics report

Examples:
  npx ts-node real-time-monitor.ts start
  npx ts-node real-time-monitor.ts report
      `);
  }
}