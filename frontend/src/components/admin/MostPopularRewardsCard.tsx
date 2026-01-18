'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp } from 'lucide-react';

interface PopularReward {
  token: string;
  count: number;
  percentage: number;
}

interface MostPopularRewardsCardProps {
  rewards: PopularReward[];
}

export function MostPopularRewardsCard({ rewards }: MostPopularRewardsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">Top Rewards</CardTitle>
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {rewards.length === 0 ? (
            <p className="text-sm text-gray-500">No reward data available</p>
          ) : (
            rewards.map((reward, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {reward.token.slice(0, 10)}...
                    </p>
                    <p className="text-xs text-gray-500">{reward.count} claims</p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {reward.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
