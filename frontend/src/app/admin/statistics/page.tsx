'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { StatisticsService, StatisticsData } from '@/services/statistics';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { StatsCard } from '@/components/admin/StatsCard';
import { TimeSeriesChart } from '@/components/admin/TimeSeriesChart';
import { RewardDistributionChart } from '@/components/admin/RewardDistributionChart';
import { MostPopularRewardsCard } from '@/components/admin/MostPopularRewardsCard';
import { UserEngagementMetrics } from '@/components/admin/UserEngagementMetrics';
import { formatEther } from 'viem';

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await StatisticsService.getStatistics();
        setStatistics(stats);
      } catch (err) {
        console.error('Error loading statistics:', err);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();

    const interval = setInterval(fetchStatistics, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:ml-64">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading statistics...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !statistics) {
    return (
      <ProtectedRoute>
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:ml-64">
          <div className="rounded-lg bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error Loading Statistics</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:ml-64">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            On-chain statistics and analytics for your rewards system.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Boxes Opened"
            value={statistics.totalBoxesOpened.toLocaleString()}
            change="All time"
          />
          <StatsCard
            title="Total Fees Collected"
            value={`${formatEther(statistics.totalFeesCollected)} ETH`}
            change="All time"
          />
          <StatsCard
            title="Unique Users"
            value={statistics.uniqueUsers.toLocaleString()}
            change="All time"
          />
          <StatsCard
            title="Reward Types"
            value={Object.keys(statistics.rewardDistribution).length.toString()}
            change="Currently in pool"
          />
        </div>

        {/* User Engagement Metrics */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">User Engagement</h2>
          <UserEngagementMetrics data={statistics.userEngagementMetrics} />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <RewardDistributionChart data={statistics.mostPopularRewards} />
          <MostPopularRewardsCard rewards={statistics.mostPopularRewards} />
        </div>

        {/* Time Series Charts */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <TimeSeriesChart
            title="Daily Statistics (Last 30 Days)"
            data={statistics.dailyStats}
            type="bar"
            xAxisKey="date"
          />
          <TimeSeriesChart
            title="Weekly Statistics (Last 12 Weeks)"
            data={statistics.weeklyStats}
            type="line"
            xAxisKey="week"
          />
        </div>

        {/* Monthly Stats */}
        <TimeSeriesChart
          title="Monthly Statistics (Last 12 Months)"
          data={statistics.monthlyStats}
          type="bar"
          xAxisKey="month"
        />

        {/* Statistics Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h3 className="font-semibold text-blue-900 mb-2 sm:mb-3">Statistics Summary</h3>
          <ul className="text-sm text-blue-800 space-y-1 sm:space-y-2">
            <li>
              • <strong>Average Fee per Box:</strong> {
                statistics.totalBoxesOpened > 0
                  ? `${(Number(formatEther(statistics.totalFeesCollected)) / statistics.totalBoxesOpened).toFixed(6)} ETH`
                  : 'N/A'
              }
            </li>
            <li>
              • <strong>Total Reward Events:</strong> {Object.keys(statistics.rewardDistribution).reduce(
                (sum, key) => sum + statistics.rewardDistribution[key],
                0
              )}
            </li>
            <li>
              • <strong>Conversion Rate:</strong> {
                statistics.totalBoxesOpened > 0
                  ? (
                      (Object.keys(statistics.rewardDistribution).reduce(
                        (sum, key) => sum + statistics.rewardDistribution[key],
                        0
                      ) /
                        statistics.totalBoxesOpened) *
                      100
                    ).toFixed(1)
                  : '0'
              }%
            </li>
            <li>
              • <strong>Average Claims Per User:</strong> {
                statistics.userEngagementMetrics.averageClaimsPerUser.toFixed(2)
              }
            </li>
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
}
