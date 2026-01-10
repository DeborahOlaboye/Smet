'use client';

import { useState, useEffect } from 'react';
import { rewardVisualizationService, DistributionData, ProbabilityData } from '@/services/rewardVisualization';
import { RewardPieChart } from './RewardPieChart';
import { ProbabilityBarChart } from './ProbabilityBarChart';
import { RewardStats } from './RewardStats';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RewardDashboardProps {
  analyticsAddress?: string;
  rewardAddress?: string;
}

export function RewardDashboard({ 
  analyticsAddress = process.env.NEXT_PUBLIC_ANALYTICS_ADDRESS || '',
  rewardAddress = process.env.NEXT_PUBLIC_REWARD_ADDRESS || ''
}: RewardDashboardProps) {
  const [distributionData, setDistributionData] = useState<DistributionData[]>([]);
  const [probabilityData, setProbabilityData] = useState<ProbabilityData[]>([]);
  const [stats, setStats] = useState({ totalOpened: 0, totalClaimed: 0, totalValue: '0' });
  const [rewardFee, setRewardFee] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!analyticsAddress || !rewardAddress) {
      setError('Contract addresses not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Initialize service (in a real app, this would use the actual provider)
      // For demo purposes, we'll use mock data
      const mockDistribution: DistributionData[] = [
        { rewardId: 0, name: 'Common Sword', count: 450, percentage: 45, color: '#10B981' },
        { rewardId: 1, name: 'Rare Shield', count: 250, percentage: 25, color: '#3B82F6' },
        { rewardId: 2, name: 'Epic Armor', count: 150, percentage: 15, color: '#8B5CF6' },
        { rewardId: 3, name: 'Legendary Gem', count: 100, percentage: 10, color: '#F59E0B' },
        { rewardId: 4, name: 'Mythic Rune', count: 50, percentage: 5, color: '#EF4444' }
      ];

      const mockProbability: ProbabilityData[] = [
        { rewardIndex: 0, weight: 4500, probability: 45, expectedValue: 45 },
        { rewardIndex: 1, weight: 2500, probability: 25, expectedValue: 25 },
        { rewardIndex: 2, weight: 1500, probability: 15, expectedValue: 15 },
        { rewardIndex: 3, weight: 1000, probability: 10, expectedValue: 10 },
        { rewardIndex: 4, weight: 500, probability: 5, expectedValue: 5 }
      ];

      setDistributionData(mockDistribution);
      setProbabilityData(mockProbability);
      setStats({ totalOpened: 1000, totalClaimed: 850, totalValue: '12.5' });
      setRewardFee('0.01');

    } catch (err) {
      console.error('Error loading reward data:', err);
      setError('Failed to load reward data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [analyticsAddress, rewardAddress]);

  const handleRefresh = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading reward analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reward Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Visualizations for reward distribution and probability calculations
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Statistics */}
      <RewardStats
        totalOpened={stats.totalOpened}
        totalClaimed={stats.totalClaimed}
        totalValue={stats.totalValue}
        rewardFee={rewardFee}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RewardPieChart 
          data={distributionData} 
          title="Reward Distribution"
          height={350}
        />
        <ProbabilityBarChart 
          data={probabilityData} 
          title="Reward Probabilities"
          height={350}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reward Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium text-gray-600">Reward</th>
                <th className="pb-2 font-medium text-gray-600">Probability</th>
                <th className="pb-2 font-medium text-gray-600">Claims</th>
                <th className="pb-2 font-medium text-gray-600">Rarity</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {distributionData.map((reward, index) => {
                const probability = probabilityData[index]?.probability || 0;
                const rarity = getRarityFromProbability(probability);
                return (
                  <tr key={reward.rewardId} className="hover:bg-gray-50">
                    <td className="py-3 font-medium">{reward.name}</td>
                    <td className="py-3">{probability.toFixed(1)}%</td>
                    <td className="py-3">{reward.count}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRarityStyle(rarity)}`}>
                        {rarity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getRarityFromProbability(probability: number): string {
  if (probability >= 40) return 'Common';
  if (probability >= 20) return 'Rare';
  if (probability >= 10) return 'Epic';
  return 'Legendary';
}

function getRarityStyle(rarity: string): string {
  const styles = {
    'Common': 'bg-gray-100 text-gray-800',
    'Rare': 'bg-blue-100 text-blue-800',
    'Epic': 'bg-purple-100 text-purple-800',
    'Legendary': 'bg-orange-100 text-orange-800'
  };
  return styles[rarity as keyof typeof styles] || styles.Common;
}