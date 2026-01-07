import { TransactionRecord } from '@/types/dashboard';

interface TransactionHistoryProps {
  transactions: TransactionRecord[];
  isLoading: boolean;
}

export function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-3 rounded-lg shadow animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📋</div>
        <h3 className="text-md font-medium text-gray-900 mb-1">No Transactions</h3>
        <p className="text-sm text-gray-600">Transaction history will appear here.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reward_open': return '📦';
      case 'token_transfer': return '💰';
      case 'nft_transfer': return '🎨';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div key={tx.hash} className="bg-white p-3 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-lg">{getTypeIcon(tx.type)}</div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(tx.timestamp * 1000).toLocaleString()}
                </p>
              </div>
            </div>
            <a
              href={`https://sepolia-blockscout.lisk.com/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              View
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}