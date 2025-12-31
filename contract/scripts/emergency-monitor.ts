import { ethers } from "hardhat";

interface ContractHealth {
  address: string;
  name: string;
  isPaused: boolean;
  balance: string;
  lastActivity: number;
}

class EmergencyMonitor {
  private contracts: { [key: string]: string } = {
    SmetReward: "0xeF85822c30D194c2B2F7cC17223C64292Bfe611b",
    SmetGold: "0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2",
    SmetHero: "0x877D1FDa6a6b668b79ca4A42388E0825667d233E",
    SmetLoot: "0xa5046538c6338DC8b52a22675338a4623D4B5475"
  };

  async checkContractHealth(): Promise<ContractHealth[]> {
    const healthReports: ContractHealth[] = [];
    
    for (const [name, address] of Object.entries(this.contracts)) {
      try {
        const contract = await ethers.getContractAt(name, address);
        const provider = ethers.provider;
        
        // Check if contract is paused
        let isPaused = false;
        try {
          isPaused = await contract.paused();
        } catch {
          // Contract might not have pause functionality
        }
        
        // Get contract balance
        const balance = await provider.getBalance(address);
        
        // Get last block timestamp as proxy for activity
        const lastBlock = await provider.getBlock("latest");
        
        healthReports.push({
          address,
          name,
          isPaused,
          balance: ethers.formatEther(balance),
          lastActivity: lastBlock?.timestamp || 0
        });
        
      } catch (error) {
        console.error(`Failed to check health for ${name}:`, error);
        healthReports.push({
          address,
          name,
          isPaused: true, // Assume paused if we can't check
          balance: "0",
          lastActivity: 0
        });
      }
    }
    
    return healthReports;
  }

  async detectAnomalies(healthReports: ContractHealth[]): Promise<string[]> {
    const alerts: string[] = [];
    
    for (const report of healthReports) {
      // Check if contract is unexpectedly paused
      if (report.isPaused) {
        alerts.push(`🚨 ${report.name} is PAUSED`);
      }
      
      // Check for unusual balance changes (this would need historical data in production)
      const balanceNum = parseFloat(report.balance);
      if (balanceNum > 1000) { // Arbitrary threshold
        alerts.push(`⚠️ ${report.name} has high balance: ${report.balance} ETH`);
      }
      
      // Check for stale activity (in production, compare with expected activity)
      const currentTime = Math.floor(Date.now() / 1000);
      const timeSinceActivity = currentTime - report.lastActivity;
      if (timeSinceActivity > 3600) { // 1 hour
        alerts.push(`⏰ ${report.name} no recent activity (${Math.floor(timeSinceActivity / 60)} minutes)`);
      }
    }
    
    return alerts;
  }

  async runHealthCheck(): Promise<void> {
    console.log("🔍 Running Emergency Health Check...");
    console.log("Timestamp:", new Date().toISOString());
    
    const healthReports = await this.checkContractHealth();
    const alerts = await this.detectAnomalies(healthReports);
    
    // Display health reports
    console.log("\n📊 Contract Health Status:");
    console.table(healthReports);
    
    // Display alerts
    if (alerts.length > 0) {
      console.log("\n🚨 ALERTS DETECTED:");
      alerts.forEach(alert => console.log(alert));
      
      // In production, this would trigger notifications
      console.log("\n📧 Notifications would be sent to emergency contacts");
    } else {
      console.log("\n✅ All systems operational");
    }
  }

  async continuousMonitoring(intervalMinutes: number = 5): Promise<void> {
    console.log(`🔄 Starting continuous monitoring (${intervalMinutes} minute intervals)`);
    
    const runCheck = async () => {
      try {
        await this.runHealthCheck();
      } catch (error) {
        console.error("❌ Health check failed:", error);
      }
    };
    
    // Run initial check
    await runCheck();
    
    // Set up interval
    setInterval(runCheck, intervalMinutes * 60 * 1000);
  }
}

// Export for use in other scripts
export { EmergencyMonitor };

// If called directly, run monitoring
if (require.main === module) {
  const monitor = new EmergencyMonitor();
  
  // Check if continuous monitoring is requested
  const args = process.argv.slice(2);
  if (args.includes("--continuous")) {
    const intervalIndex = args.indexOf("--interval");
    const interval = intervalIndex !== -1 ? parseInt(args[intervalIndex + 1]) : 5;
    
    monitor.continuousMonitoring(interval)
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    monitor.runHealthCheck()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}