import { ethers } from 'hardhat';
import { EventLog } from 'ethers';

interface TransactionEvent {
  transactionId: string;
  user: string;
  contractAddress: string;
  contractName: string;
  action: string;
  amount: string;
  tokenId: string;
  blockNumber: number;
  timestamp: number;
}

class TransactionMonitor {
  private transactionHistory: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;
  private isMonitoring = false;

  async initialize(provider: ethers.Provider, transactionHistoryAddress: string) {
    this.provider = provider;
    
    const abi = [
      'event TransactionRecorded(uint256 indexed transactionId, address indexed user, address indexed contractAddress, string action, uint256 amount, uint256 tokenId)',
      'function getTransaction(uint256 transactionId) view returns (tuple(address user, address contractAddress, string action, uint256 amount, uint256 tokenId, bytes32 txHash, uint256 timestamp, uint256 blockNumber))'
    ];

    this.transactionHistory = new ethers.Contract(transactionHistoryAddress, abi, provider);
  }

  async startMonitoring() {
    if (!this.transactionHistory || this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log('🔍 Starting transaction monitoring...');

    // Listen for new transaction events
    this.transactionHistory.on('TransactionRecorded', async (
      transactionId: bigint,
      user: string,
      contractAddress: string,
      action: string,
      amount: bigint,
      tokenId: bigint,
      event: EventLog
    ) => {
      try {
        const block = await event.getBlock();
        const contractName = this.getContractName(contractAddress);
        
        const transactionEvent: TransactionEvent = {
          transactionId: transactionId.toString(),
          user,
          contractAddress,
          contractName,
          action,
          amount: ethers.formatEther(amount),
          tokenId: tokenId.toString(),
          blockNumber: event.blockNumber,
          timestamp: block.timestamp
        };

        this.handleNewTransaction(transactionEvent);
      } catch (error) {
        console.error('Error processing transaction event:', error);
      }
    });

    console.log('✅ Transaction monitoring started');
  }

  stopMonitoring() {
    if (this.transactionHistory && this.isMonitoring) {
      this.transactionHistory.removeAllListeners('TransactionRecorded');
      this.isMonitoring = false;
      console.log('⏹️ Transaction monitoring stopped');
    }
  }

  private handleNewTransaction(transaction: TransactionEvent) {
    const timestamp = new Date(transaction.timestamp * 1000).toLocaleString();
    
    console.log('\n📊 New Transaction Recorded:');
    console.log('============================');
    console.log(`ID: ${transaction.transactionId}`);
    console.log(`User: ${transaction.user}`);
    console.log(`Contract: ${transaction.contractName} (${transaction.contractAddress})`);
    console.log(`Action: ${this.getActionDisplayName(transaction.action)}`);
    console.log(`Amount: ${transaction.amount === '0.0' ? 'N/A' : transaction.amount + ' ETH'}`);
    console.log(`Token ID: ${transaction.tokenId === '0' ? 'N/A' : '#' + transaction.tokenId}`);
    console.log(`Block: ${transaction.blockNumber}`);
    console.log(`Time: ${timestamp}`);
    console.log('============================\n');

    // You can add additional processing here:
    // - Send notifications
    // - Update databases
    // - Trigger webhooks
    // - Analytics processing
  }

  async getRecentTransactions(limit: number = 10): Promise<TransactionEvent[]> {
    if (!this.transactionHistory) {
      throw new Error('Monitor not initialized');
    }

    try {
      const filter = this.transactionHistory.filters.TransactionRecorded();
      const events = await this.transactionHistory.queryFilter(filter, -1000); // Last 1000 blocks

      const recentEvents = events.slice(-limit).reverse();
      const transactions: TransactionEvent[] = [];

      for (const event of recentEvents) {
        if (event.args) {
          const tx = await this.transactionHistory.getTransaction(event.args.transactionId);
          const block = await event.getBlock();
          
          transactions.push({
            transactionId: event.args.transactionId.toString(),
            user: tx.user,
            contractAddress: tx.contractAddress,
            contractName: this.getContractName(tx.contractAddress),
            action: tx.action,
            amount: ethers.formatEther(tx.amount),
            tokenId: tx.tokenId.toString(),
            blockNumber: Number(tx.blockNumber),
            timestamp: block.timestamp
          });
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  private getContractName(address: string): string {
    const contractNames: { [key: string]: string } = {
      '0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2': 'SmetGold',
      '0x877D1FDa6a6b668b79ca4A42388E0825667d233E': 'SmetHero',
      '0xa5046538c6338DC8b52a22675338a4623D4B5475': 'SmetLoot',
      '0xeF85822c30D194c2B2F7cC17223C64292Bfe611b': 'SmetReward'
    };

    return contractNames[address.toLowerCase()] || 'Unknown Contract';
  }

  private getActionDisplayName(action: string): string {
    const actionNames: { [key: string]: string } = {
      'TRANSFER': 'Transfer',
      'TRANSFER_FROM': 'Transfer From',
      'APPROVE': 'Approve',
      'APPROVE_ALL': 'Approve All',
      'REVOKE_ALL': 'Revoke All',
      'MINT': 'Mint',
      'SAFE_TRANSFER': 'Safe Transfer',
      'SAFE_TRANSFER_DATA': 'Safe Transfer with Data',
      'BATCH_TRANSFER': 'Batch Transfer',
      'REWARD_OPEN': 'Open Reward',
      'REWARD_CLAIM': 'Claim Reward',
      'REFILL': 'Refill Contract'
    };

    return actionNames[action] || action;
  }

  async generateReport() {
    console.log('\n📈 Transaction Activity Report');
    console.log('==============================');

    try {
      const recentTransactions = await this.getRecentTransactions(50);
      
      // Group by action
      const actionCounts: { [key: string]: number } = {};
      const contractCounts: { [key: string]: number } = {};
      const userCounts: { [key: string]: number } = {};

      recentTransactions.forEach(tx => {
        actionCounts[tx.action] = (actionCounts[tx.action] || 0) + 1;
        contractCounts[tx.contractName] = (contractCounts[tx.contractName] || 0) + 1;
        userCounts[tx.user] = (userCounts[tx.user] || 0) + 1;
      });

      console.log('\nTop Actions:');
      Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([action, count]) => {
          console.log(`  ${this.getActionDisplayName(action)}: ${count}`);
        });

      console.log('\nContract Activity:');
      Object.entries(contractCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([contract, count]) => {
          console.log(`  ${contract}: ${count}`);
        });

      console.log('\nMost Active Users:');
      Object.entries(userCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([user, count]) => {
          console.log(`  ${user.slice(0, 10)}...${user.slice(-4)}: ${count}`);
        });

      console.log(`\nTotal Recent Transactions: ${recentTransactions.length}`);
      console.log('==============================\n');

    } catch (error) {
      console.error('Error generating report:', error);
    }
  }
}

// CLI usage
async function main() {
  const monitor = new TransactionMonitor();
  
  // Initialize with your transaction history contract address
  const transactionHistoryAddress = process.env.TRANSACTION_HISTORY_ADDRESS || '';
  
  if (!transactionHistoryAddress) {
    console.error('Please set TRANSACTION_HISTORY_ADDRESS environment variable');
    process.exit(1);
  }

  const provider = ethers.provider;
  await monitor.initialize(provider, transactionHistoryAddress);

  const command = process.argv[2];

  switch (command) {
    case 'start':
      await monitor.startMonitoring();
      // Keep the process running
      process.stdin.resume();
      break;
    
    case 'report':
      await monitor.generateReport();
      process.exit(0);
      break;
    
    case 'recent':
      const limit = parseInt(process.argv[3]) || 10;
      const transactions = await monitor.getRecentTransactions(limit);
      console.log(`\n📋 Last ${transactions.length} Transactions:`);
      transactions.forEach((tx, i) => {
        console.log(`${i + 1}. ${tx.contractName} - ${monitor['getActionDisplayName'](tx.action)} by ${tx.user.slice(0, 10)}...`);
      });
      process.exit(0);
      break;
    
    default:
      console.log('Usage: npx ts-node transaction-monitor.ts [start|report|recent [limit]]');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { TransactionMonitor };