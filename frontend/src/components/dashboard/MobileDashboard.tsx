import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { StatsOverview } from './StatsOverview';
import { AssetsGallery } from './AssetsGallery';
import { RewardHistoryList } from './RewardHistoryList';
import { TransactionHistory } from './TransactionHistory';

type TabType = 'overview' | 'assets' | 'history' | 'transactions';

export function MobileDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { stats, ownedAssets, rewardHistory, transactions, isLoading, error } = useDashboard();

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'assets' as TabType, label: 'Assets', icon: '🎭' },
    { id: 'history' as TabType, label: 'History', icon: '📜' },
    { id: 'transactions' as TabType, label: 'Txns', icon: '📋' },
  ];

  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <div className="text-red-500 text-3xl mb-3">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-600 text-sm">Track your gaming progress</p>
      </div>

      <div className="px-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatsOverview stats={stats} isLoading={isLoading} />
            <div>
              <h2 className="text-lg font-semibold mb-3">Recent Assets</h2>
              <AssetsGallery assets={ownedAssets.slice(0, 4)} isLoading={isLoading} />
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">My Assets</h2>
              <span className="text-sm text-gray-600">{ownedAssets.length}</span>
            </div>
            <AssetsGallery assets={ownedAssets} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Rewards</h2>
              <span className="text-sm text-gray-600">{rewardHistory.length}</span>
            </div>
            <RewardHistoryList history={rewardHistory} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Transactions</h2>
              <span className="text-sm text-gray-600">{transactions.length}</span>
            </div>
            <TransactionHistory transactions={transactions} isLoading={isLoading} />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-2 text-center ${
                activeTab === tab.id
                  ? 'text-blue-600 border-t-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <div className="text-lg mb-1">{tab.icon}</div>
              <div className="text-xs font-medium">{tab.label}</div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}