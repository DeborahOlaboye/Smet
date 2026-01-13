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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminReward } from '@/services/adminRewards';
import { Loader2, PackagePlus } from 'lucide-react';

interface RefillStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: AdminReward | null;
  onRefill: (rewardId: string, amount: number) => Promise<void>;
}

export function RefillStockDialog({ open, onOpenChange, reward, onRefill }: RefillStockDialogProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reward || amount <= 0) return;

    setLoading(true);
    try {
      await onRefill(reward.id, amount);
      setAmount(0);
      onOpenChange(false);
    } catch (error) {
      console.error('Error refilling stock:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!reward) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            Refill Reward Stock
          </DialogTitle>
          <DialogDescription>
            Add more stock to this reward to make it available for users to claim.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm font-medium text-gray-900 mb-1">Reward:</p>
              <p className="text-sm font-semibold text-blue-700">{reward.name}</p>
              <p className="text-xs text-gray-600 mt-2">Type: {reward.assetType}</p>
              <p className="text-xs text-gray-600">Current Stock: {reward.remaining}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="refill-amount">Amount to Add</Label>
              <Input
                id="refill-amount"
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={amount || ''}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-gray-500">
                New total stock will be: {reward.remaining + amount}
              </p>
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
            <Button type="submit" disabled={loading || amount <= 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Refill Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
