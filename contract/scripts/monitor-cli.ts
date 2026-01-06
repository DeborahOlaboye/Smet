#!/usr/bin/env node

import { ethers } from "hardhat";
import { SmetEventMonitor } from "./event-monitor";
import { RealTimeMonitor, EventAnalytics } from "./real-time-monitor";
import { DashboardService } from "./dashboard-service";

class MonitoringCLI {
  private provider: ethers.Provider;

  constructor() {
    this.provider = ethers.provider;
  }

  async handleCommand(args: string[]): Promise<void> {
    const command = args[0];

    switch (command) {
      case "start":
        await this.startMonitoring();
        break;
      case "events":
        await this.getEvents(args.slice(1));
        break;
      case "metrics":
        await this.getMetrics(args.slice(1));
        break;
      case "dashboard":
        await this.startDashboard();
        break;
      case "test":
        await this.testConnections();
        break;
      default:
        this.showHelp();
    }
  }

  private async startMonitoring(): Promise<void> {
    console.log("🚀 Starting real-time monitoring...");
    
    const monitor = new RealTimeMonitor(this.provider);
    
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping monitor...');
      monitor.stop();
      process.exit(0);
    });

    await monitor.start();
    console.log('📡 Monitoring active. Press Ctrl+C to stop.');
  }

  private async getEvents(args: string[]): Promise<void> {
    const contract = args[0] || "SmetReward";
    const event = args[1] || "Opened";
    const blocks = parseInt(args[2]) || 100;

    console.log(`📋 Getting ${event} events from ${contract} (last ${blocks} blocks)...`);

    const monitor = new SmetEventMonitor(this.provider);
    await monitor.setupContracts();

    try {
      const currentBlock = await this.provider.getBlockNumber();
      const events = await monitor.getHistoricalEvents(
        contract, 
        event, 
        currentBlock - blocks
      );

      console.log(`Found ${events.length} events:`);
      events.forEach((event, index) => {
        console.log(`${index + 1}. Block ${event.blockNumber}: ${event.event}`);
        console.log(`   Tx: ${event.transactionHash}`);
        console.log(`   Time: ${new Date(event.timestamp * 1000).toISOString()}`);
      });

    } catch (error) {
      console.error("❌ Error fetching events:", error);
    }
  }

  private async getMetrics(args: string[]): Promise<void> {
    const hours = parseInt(args[0]) || 24;
    
    console.log(`📊 Getting metrics for last ${hours} hours...`);

    const dashboard = new DashboardService(this.provider);
    await dashboard.initialize();

    try {
      const metrics = await dashboard.getMetrics(hours);
      
      console.log("\n📈 Metrics:");
      console.log(`  Total Rewards: ${metrics.totalRewards}`);
      console.log(`  Total Transfers: ${metrics.totalTransfers}`);
      console.log(`  Active Users: ${metrics.activeUsers}`);
      console.log(`  Total Volume: ${metrics.totalVolume} ETH`);

      console.log("\n👥 Top Users:");
      metrics.topUsers.slice(0, 5).forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.address}: ${user.count} activities`);
      });

    } catch (error) {
      console.error("❌ Error fetching metrics:", error);
    }
  }

  private async startDashboard(): Promise<void> {
    console.log("🌐 Starting dashboard server...");
    
    try {
      const { app, initializeServices } = await import("./dashboard-server");
      await initializeServices();
      
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`✅ Dashboard running at http://localhost:${port}`);
      });

    } catch (error) {
      console.error("❌ Error starting dashboard:", error);
    }
  }

  private async testConnections(): Promise<void> {
    console.log("🔍 Testing connections...");

    try {
      // Test provider connection
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`✅ Provider connected - Block: ${blockNumber}`);

      // Test contract connections
      const monitor = new SmetEventMonitor(this.provider);
      await monitor.setupContracts();
      console.log("✅ Contracts loaded");

      // Test event fetching
      const events = await monitor.getHistoricalEvents("SmetReward", "Opened", blockNumber - 10);
      console.log(`✅ Event fetching works - Found ${events.length} recent events`);

    } catch (error) {
      console.error("❌ Connection test failed:", error);
    }
  }

  private showHelp(): void {
    console.log(`
Event Monitoring CLI

Usage: npx ts-node monitor-cli.ts [command] [options]

Commands:
  start                     Start real-time monitoring
  events <contract> <event> Get historical events
  metrics [hours]           Get system metrics
  dashboard                 Start web dashboard
  test                      Test connections

Examples:
  npx ts-node monitor-cli.ts start
  npx ts-node monitor-cli.ts events SmetReward Opened 100
  npx ts-node monitor-cli.ts metrics 24
  npx ts-node monitor-cli.ts dashboard
  npx ts-node monitor-cli.ts test

Contracts: SmetReward, SmetGold, SmetHero, SmetLoot
Events: Opened, RewardOut, Transfer, Paused, etc.
    `);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    args.push("help");
  }

  const cli = new MonitoringCLI();
  await cli.handleCommand(args);
}

if (require.main === module) {
  main().catch(console.error);
}