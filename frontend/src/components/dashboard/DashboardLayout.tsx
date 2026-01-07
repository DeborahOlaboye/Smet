import { useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { StatsOverview } from './StatsOverview';
import { AssetsGallery } from './AssetsGallery';
import { RewardHistoryList } from './RewardHistoryList';
import { TransactionHistory } from './TransactionHistory';
import { MobileDashboard } from './MobileDashboard';

type TabType = 'overview' | 'assets' | 'history' | 'transactions';

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobile, setIsMobile] = useState(false);
  const { stats, ownedAssets, rewardHistory, transactions, isLoading, error } = useDashboard();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileDashboard />;
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'assets' as TabType, label: 'My Assets', icon: '🎭' },
    { id: 'history' as TabType, label: 'Rewards', icon: '📜' },
    { id: 'transactions' as TabType, label: 'Transactions', icon: '📋' },
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your rewards, assets, and gaming progress</p>
      </div>

      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <StatsOverview stats={stats} isLoading={isLoading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Assets</h2>
                <AssetsGallery assets={ownedAssets.slice(0, 4)} isLoading={isLoading} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Rewards</h2>
                <RewardHistoryList history={rewardHistory.slice(0, 3)} isLoading={isLoading} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Assets</h2>
              <span className="text-sm text-gray-600">
                {ownedAssets.length} items
              </span>
            </div>
            <AssetsGallery assets={ownedAssets} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Reward History</h2>
              <span className="text-sm text-gray-600">
                {rewardHistory.length} rewards
              </span>
            </div>
            <RewardHistoryList history={rewardHistory} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <span className="text-sm text-gray-600">
                {transactions.length} transactions
              </span>
            </div>
            <TransactionHistory transactions={transactions} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}