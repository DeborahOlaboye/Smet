import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { DashboardService } from '@/services/dashboard';
import { UserStats, OwnedAsset, RewardHistory, TransactionRecord } from '@/types/dashboard';

export function useDashboard() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [ownedAssets, setOwnedAssets] = useState<OwnedAsset[]>([]);
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!address || !isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const [userStats, heroes, history, txHistory] = await Promise.all([
        DashboardService.getUserStats(address),
        DashboardService.getOwnedHeroes(address),
        DashboardService.getRewardHistory(address),
        DashboardService.getTransactionHistory(address),
      ]);

      setStats(userStats);
      setOwnedAssets(heroes);
      setRewardHistory(history);
      setTransactions(txHistory);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchDashboardData();
    } else {
      setStats(null);
      setOwnedAssets([]);
      setRewardHistory([]);
      setTransactions([]);
    }
  }, [address, isConnected]);

  return {
    stats,
    ownedAssets,
    rewardHistory,
    transactions,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}