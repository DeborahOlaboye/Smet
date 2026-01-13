'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminReward } from '@/services/adminRewards';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: AdminReward | null;
  onDelete: (rewardId: string) => Promise<void>;
}

export function DeleteRewardDialog({ open, onOpenChange, reward, onDelete }: DeleteRewardDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!reward) return;

    setLoading(true);
    try {
      await onDelete(reward.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting reward:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!reward) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Reward
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently disable the reward from the prize pool.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-medium text-gray-900 mb-1">Reward to be deleted:</p>
            <p className="text-sm font-semibold text-red-700">{reward.name}</p>
            <p className="text-xs text-gray-600 mt-2">Type: {reward.assetType}</p>
            <p className="text-xs text-gray-600">Current Stock: {reward.remaining}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Reward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
