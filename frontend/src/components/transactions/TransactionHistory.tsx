'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Transaction, transactionHistoryService } from '@/services/transactionHistory';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Filter } from 'lucide-react';

interface TransactionHistoryProps {
  limit?: number;
  showFilters?: boolean;
}

export function TransactionHistory({ limit = 20, showFilters = true }: TransactionHistoryProps) {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const loadTransactions = async (reset = false) => {
    if (!address || !isConnected) return;

    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const userTransactions = await transactionHistoryService.getUserTransactions(
        address,
        currentOffset,
        limit
      );

      if (reset) {
        setTransactions(userTransactions);
        setOffset(limit);
      } else {
        setTransactions(prev => [...prev, ...userTransactions]);
        setOffset(prev => prev + limit);
      }

      setHasMore(userTransactions.length === limit);

      const count = await transactionHistoryService.getUserTransactionCount(address);
      setTotalCount(count);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadTransactions(true);
    }
  }, [address, isConnected]);

  const handleRefresh = () => {
    setOffset(0);
    loadTransactions(true);
  };

  const handleLoadMore = () => {
    loadTransactions(false);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-sm sm:text-base text-gray-500">Connect your wallet to view transaction history</p>
      </div>
    );
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center py-8 sm:py-12">
        <LoadingSpinner size="md" text="Loading transactions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No transactions yet</h3>
        <p className="text-sm sm:text-base text-gray-500">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Transaction History</h2>
          <p className="text-xs sm:text-sm text-gray-500">{totalCount} total transactions</p>
        </div>
        <div className="flex items-center gap-2">
          {showFilters && (
            <Button variant="outline" size="sm" className="flex-shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          )}
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="block sm:hidden space-y-3">
        {transactions.map((tx) => {
          const formatted = transactionHistoryService.formatTransactionForDisplay(tx);
          return (
            <TransactionCard key={tx.id} transaction={formatted} />
          );
        })}
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Token ID</th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((tx) => {
              const formatted = transactionHistoryService.formatTransactionForDisplay(tx);
              return (
                <TransactionRow key={tx.id} transaction={formatted} />
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleLoadMore} disabled={loading} variant="outline">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function TransactionCard({ transaction }: { transaction: any }) {
  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'mint': return 'bg-green-100 text-green-800';
      case 'transfer': case 'transfer_from': case 'safe_transfer': return 'bg-blue-100 text-blue-800';
      case 'approve': case 'approve_all': return 'bg-yellow-100 text-yellow-800';
      case 'reward_open': case 'reward_claim': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getActionColor(transaction.action)}`}>
              {transaction.actionDisplay}
            </span>
            <span className="text-xs text-gray-500">{transaction.contractName}</span>
          </div>
          <p className="text-xs text-gray-500">{transaction.timestampDisplay}</p>
        </div>
        <a
          href={`https://etherscan.io/block/${transaction.blockNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-gray-500">Amount:</span>
          <span className="ml-1 font-medium">{transaction.amountDisplay}</span>
        </div>
        <div>
          <span className="text-gray-500">Token ID:</span>
          <span className="ml-1 font-medium">{transaction.tokenIdDisplay}</span>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: any }) {
  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'mint': return 'bg-green-100 text-green-800';
      case 'transfer': case 'transfer_from': case 'safe_transfer': return 'bg-blue-100 text-blue-800';
      case 'approve': case 'approve_all': return 'bg-yellow-100 text-yellow-800';
      case 'reward_open': case 'reward_claim': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(transaction.action)}`}>
          {transaction.actionDisplay}
        </span>
      </td>
      <td className="py-4 text-sm text-gray-900">{transaction.contractName}</td>
      <td className="py-4 text-sm text-gray-500">{transaction.amountDisplay}</td>
      <td className="py-4 text-sm text-gray-500">{transaction.tokenIdDisplay}</td>
      <td className="py-4 text-sm text-gray-500">{transaction.timestampDisplay}</td>
      <td className="py-4">
        <a
          href={`https://etherscan.io/block/${transaction.blockNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {transaction.blockNumber}
        </a>
      </td>
    </tr>
  );
}