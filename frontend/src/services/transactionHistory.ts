import { ethers } from 'ethers';

export interface Transaction {
  id: string;
  user: string;
  contractAddress: string;
  contractName: string;
  action: string;
  amount: string;
  tokenId: string;
  txHash: string;
  timestamp: number;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TransactionFilters {
  user?: string;
  contractAddress?: string;
  action?: string;
  fromDate?: Date;
  toDate?: Date;
}

class TransactionHistoryService {
  private provider: ethers.Provider | null = null;
  private transactionHistoryContract: ethers.Contract | null = null;

  async initialize(provider: ethers.Provider, contractAddress: string) {
    this.provider = provider;
    
    const abi = [
      'function getUserTransactionsPaginated(address user, uint256 offset, uint256 limit) view returns (tuple(address user, address contractAddress, string action, uint256 amount, uint256 tokenId, bytes32 txHash, uint256 timestamp, uint256 blockNumber)[])',
      'function getTransaction(uint256 transactionId) view returns (tuple(address user, address contractAddress, string action, uint256 amount, uint256 tokenId, bytes32 txHash, uint256 timestamp, uint256 blockNumber))',
      'function getUserTransactionCount(address user) view returns (uint256)',
      'function getTotalTransactions() view returns (uint256)',
      'event TransactionRecorded(uint256 indexed transactionId, address indexed user, address indexed contractAddress, string action, uint256 amount, uint256 tokenId)'
    ];

    this.transactionHistoryContract = new ethers.Contract(contractAddress, abi, provider);
  }

  async getUserTransactions(
    userAddress: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<Transaction[]> {
    if (!this.transactionHistoryContract) {
      throw new Error('Service not initialized');
    }

    try {
      const rawTransactions = await this.transactionHistoryContract.getUserTransactionsPaginated(
        userAddress,
        offset,
        limit
      );

      return rawTransactions.map((tx: any, index: number) => ({
        id: (offset + index).toString(),
        user: tx.user,
        contractAddress: tx.contractAddress,
        contractName: this.getContractName(tx.contractAddress),
        action: tx.action,
        amount: ethers.formatEther(tx.amount),
        tokenId: tx.tokenId.toString(),
        txHash: tx.txHash,
        timestamp: Number(tx.timestamp),
        blockNumber: Number(tx.blockNumber),
        status: 'confirmed' as const
      }));
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  }

  async getUserTransactionCount(userAddress: string): Promise<number> {
    if (!this.transactionHistoryContract) {
      throw new Error('Service not initialized');
    }

    try {
      const count = await this.transactionHistoryContract.getUserTransactionCount(userAddress);
      return Number(count);
    } catch (error) {
      console.error('Error fetching user transaction count:', error);
      throw error;
    }
  }

  async getTotalTransactions(): Promise<number> {
    if (!this.transactionHistoryContract) {
      throw new Error('Service not initialized');
    }

    try {
      const total = await this.transactionHistoryContract.getTotalTransactions();
      return Number(total);
    } catch (error) {
      console.error('Error fetching total transactions:', error);
      throw error;
    }
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    if (!this.transactionHistoryContract || !this.provider) {
      throw new Error('Service not initialized');
    }

    try {
      // Get recent TransactionRecorded events
      const filter = this.transactionHistoryContract.filters.TransactionRecorded();
      const events = await this.transactionHistoryContract.queryFilter(filter, -1000); // Last 1000 blocks

      const recentEvents = events.slice(-limit).reverse(); // Get most recent and reverse order

      const transactions: Transaction[] = [];
      for (const event of recentEvents) {
        if (event.args) {
          const tx = await this.transactionHistoryContract.getTransaction(event.args.transactionId);
          transactions.push({
            id: event.args.transactionId.toString(),
            user: tx.user,
            contractAddress: tx.contractAddress,
            contractName: this.getContractName(tx.contractAddress),
            action: tx.action,
            amount: ethers.formatEther(tx.amount),
            tokenId: tx.tokenId.toString(),
            txHash: tx.txHash,
            timestamp: Number(tx.timestamp),
            blockNumber: Number(tx.blockNumber),
            status: 'confirmed' as const
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
    // Map contract addresses to names
    const contractNames: { [key: string]: string } = {
      // These would be populated with actual deployed addresses
      '0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2': 'SmetGold',
      '0x877D1FDa6a6b668b79ca4A42388E0825667d233E': 'SmetHero',
      '0xa5046538c6338DC8b52a22675338a4623D4B5475': 'SmetLoot',
      '0xeF85822c30D194c2B2F7cC17223C64292Bfe611b': 'SmetReward'
    };

    return contractNames[address] || 'Unknown Contract';
  }

  getActionDisplayName(action: string): string {
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

  formatTransactionForDisplay(transaction: Transaction) {
    return {
      ...transaction,
      actionDisplay: this.getActionDisplayName(transaction.action),
      timestampDisplay: new Date(transaction.timestamp * 1000).toLocaleString(),
      amountDisplay: transaction.amount === '0.0' ? '-' : `${transaction.amount} ETH`,
      tokenIdDisplay: transaction.tokenId === '0' ? '-' : `#${transaction.tokenId}`
    };
  }
}

export const transactionHistoryService = new TransactionHistoryService();