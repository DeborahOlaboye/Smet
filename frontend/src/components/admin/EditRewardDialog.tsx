'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminReward, EditRewardParams } from '@/services/adminRewards';
import { Loader2 } from 'lucide-react';

interface EditRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: AdminReward | null;
  onEdit: (params: EditRewardParams) => Promise<void>;
}

export function EditRewardDialog({ open, onOpenChange, reward, onEdit }: EditRewardDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditRewardParams>({
    id: '',
    weight: 0,
    stock: 0,
  });

  useEffect(() => {
    if (reward) {
      setFormData({
        id: reward.id,
        weight: reward.weight,
        stock: reward.remaining,
      });
    }
  }, [reward]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onEdit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error editing reward:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!reward) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Reward</DialogTitle>
          <DialogDescription>
            Update the reward&apos;s probability weight and stock level.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Reward Name</Label>
              <p className="text-sm font-medium">{reward.name}</p>
            </div>

            <div className="grid gap-2">
              <Label>Asset Type</Label>
              <p className="text-sm text-gray-600">{reward.assetType}</p>
            </div>

            <div className="grid gap-2">
              <Label>Token Address</Label>
              <p className="text-xs font-mono text-gray-600 truncate">{reward.tokenAddress}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-weight">Weight (Probability Factor)</Label>
              <Input
                id="edit-weight"
                type="number"
                min="1"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-gray-500">
                Current probability: {(reward.probability * 100).toFixed(2)}%
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-stock">Stock Level</Label>
              <Input
                id="edit-stock"
                type="number"
                min="0"
                value={formData.stock || ''}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-gray-500">
                Current stock: {reward.remaining}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
