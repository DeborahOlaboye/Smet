'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User, TrendingUp } from 'lucide-react';

interface UserEngagementData {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageClaimsPerUser: number;
}

interface UserEngagementMetricsProps {
  data: UserEngagementData;
}

export function UserEngagementMetrics({ data }: UserEngagementMetricsProps) {
  const metrics = [
    {
      label: 'Daily Active Users',
      value: data.dailyActiveUsers.toString(),
      icon: User,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Weekly Active Users',
      value: data.weeklyActiveUsers.toString(),
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Monthly Active Users',
      value: data.monthlyActiveUsers.toString(),
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Avg Claims Per User',
      value: data.averageClaimsPerUser.toFixed(2),
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {metric.label}
              </CardTitle>
              <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg ${metric.color} flex items-center justify-center`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
