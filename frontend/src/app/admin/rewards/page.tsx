'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { RewardsListTable } from '@/components/admin/RewardsListTable';
import { RewardsStats } from '@/components/admin/RewardsStats';
import { RewardsFilter } from '@/components/admin/RewardsFilter';
import { AddRewardDialog } from '@/components/admin/AddRewardDialog';
import { EditRewardDialog } from '@/components/admin/EditRewardDialog';
import { DeleteRewardDialog } from '@/components/admin/DeleteRewardDialog';
import { RefillStockDialog } from '@/components/admin/RefillStockDialog';
import { RewardHistory, RewardHistoryEntry } from '@/components/admin/RewardHistory';
import {
  AdminReward,
  fetchAdminRewards,
  addReward,
  updateReward,
  deleteReward,
  refillRewardStock,
  AddRewardParams,
  EditRewardParams,
} from '@/services/adminRewards';
import { useToast } from '@/hooks/use-toast';

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<AdminReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RewardHistoryEntry[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refillDialogOpen, setRefillDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<AdminReward | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminRewards();
      setRewards(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rewards');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to load rewards',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReward = async (params: AddRewardParams) => {
    const result = await addReward(params);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Reward added successfully',
      });
      await loadRewards();
      addHistoryEntry({
        action: 'added',
        rewardName: params.name,
        amount: parseInt(params.idOrAmount) || 0,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to add reward',
      });
    }
  };

  const handleEditReward = async (params: EditRewardParams) => {
    const result = await updateReward(params);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Reward updated successfully',
      });
      await loadRewards();
      addHistoryEntry({
        action: 'edited',
        rewardName: selectedReward?.name || 'Unknown',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to update reward',
      });
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    const result = await deleteReward(rewardId);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Reward deleted successfully',
      });
      await loadRewards();
      addHistoryEntry({
        action: 'deleted',
        rewardName: selectedReward?.name || 'Unknown',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to delete reward',
      });
    }
  };

  const handleRefillStock = async (rewardId: string, amount: number) => {
    const result = await refillRewardStock(rewardId, amount);
    if (result.success) {
      toast({
        title: 'Success',
        description: `Stock refilled with ${amount} items`,
      });
      await loadRewards();
      addHistoryEntry({
        action: 'refilled',
        rewardName: selectedReward?.name || 'Unknown',
        amount,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to refill stock',
      });
    }
  };

  const addHistoryEntry = (entry: Omit<RewardHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: RewardHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setHistory([newEntry, ...history].slice(0, 50)); // Keep last 50 entries
  };

  const openEditDialog = (reward: AdminReward) => {
    setSelectedReward(reward);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (reward: AdminReward) => {
    setSelectedReward(reward);
    setDeleteDialogOpen(true);
  };

  const openRefillDialog = (reward: AdminReward) => {
    setSelectedReward(reward);
    setRefillDialogOpen(true);
  };

  // Filter rewards
  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssetType = assetTypeFilter === 'all' || reward.assetType === assetTypeFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && reward.isActive) ||
      (statusFilter === 'inactive' && !reward.isActive);
    return matchesSearch && matchesAssetType && matchesStatus;
  });

  return (
    <ProtectedRoute>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:ml-64">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rewards Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage rewards in the prize pool
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Reward
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && <RewardsStats rewards={rewards} />}

        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-base sm:text-lg">Current Rewards</CardTitle>
            <RewardsFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              assetTypeFilter={assetTypeFilter}
              onAssetTypeChange={setAssetTypeFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <RewardsListTable
                rewards={filteredRewards}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onRefill={openRefillDialog}
              />
            )}
          </CardContent>
        </Card>

        <RewardHistory entries={history} />
      </div>

      <AddRewardDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddReward}
      />

      <EditRewardDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        reward={selectedReward}
        onEdit={handleEditReward}
      />

      <DeleteRewardDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        reward={selectedReward}
        onDelete={handleDeleteReward}
      />

      <RefillStockDialog
        open={refillDialogOpen}
        onOpenChange={setRefillDialogOpen}
        reward={selectedReward}
        onRefill={handleRefillStock}
      />
    </ProtectedRoute>
  );
}
