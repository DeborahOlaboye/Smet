import { UserStats } from '@/types/dashboard';

interface StatsOverviewProps {
  stats: UserStats | null;
  isLoading: boolean;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: 'SmetGold Balance',
      value: `${Number(stats.smetGoldBalance) / 1e18} GOLD`,
      icon: '🪙',
    },
    {
      label: 'Heroes Owned',
      value: stats.heroesOwned.toString(),
      icon: '🦸',
    },
    {
      label: 'Boxes Opened',
      value: stats.boxesOpened.toString(),
      icon: '📦',
    },
    {
      label: 'Total Rewards',
      value: stats.totalRewardsWon.toString(),
      icon: '🎁',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
            <div className="text-3xl">{item.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}