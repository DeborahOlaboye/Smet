'use client';

import { TrendingUp, Package, DollarSign, Target } from 'lucide-react';

interface RewardStatsProps {
  totalOpened: number;
  totalClaimed: number;
  totalValue: string;
  rewardFee: string;
}

export function RewardStats({ totalOpened, totalClaimed, totalValue, rewardFee }: RewardStatsProps) {
  const claimRate = totalOpened > 0 ? (totalClaimed / totalOpened) * 100 : 0;

  const stats = [
    {
      name: 'Total Opened',
      value: formatNumber(totalOpened),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Total Claimed',
      value: formatNumber(totalClaimed),
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Claim Rate',
      value: `${claimRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Total Value',
      value: `${parseFloat(totalValue).toFixed(2)} ETH`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>
      
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reward Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Entry Fee</span>
            <span className="text-sm font-bold text-gray-900">{parseFloat(rewardFee).toFixed(4)} ETH</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Success Rate</span>
            <span className="text-sm font-bold text-gray-900">{claimRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

function StatCard({ name, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border p-4 sm:p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{name}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}