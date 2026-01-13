'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminReward } from '@/services/adminRewards';
import { Package, TrendingUp, AlertTriangle, Percent } from 'lucide-react';

interface RewardsStatsProps {
  rewards: AdminReward[];
}

export function RewardsStats({ rewards }: RewardsStatsProps) {
  const totalRewards = rewards.length;
  const activeRewards = rewards.filter(r => r.isActive).length;
  const totalStock = rewards.reduce((sum, r) => sum + r.remaining, 0);
  const lowStockRewards = rewards.filter(r => r.remaining < 10 && r.remaining > 0).length;

  const stats = [
    {
      title: 'Total Rewards',
      value: totalRewards,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Rewards',
      value: activeRewards,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Stock',
      value: totalStock,
      icon: Percent,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Low Stock',
      value: lowStockRewards,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
