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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddRewardParams, RewardAssetType } from '@/services/adminRewards';
import { Loader2 } from 'lucide-react';

interface AddRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (params: AddRewardParams) => Promise<void>;
}

export function AddRewardDialog({ open, onOpenChange, onAdd }: AddRewardDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddRewardParams>({
    assetType: 'ERC20',
    tokenAddress: '',
    idOrAmount: '',
    weight: 0,
    name: '',
    description: '',
    image: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd(formData);
      // Reset form
      setFormData({
        assetType: 'ERC20',
        tokenAddress: '',
        idOrAmount: '',
        weight: 0,
        name: '',
        description: '',
        image: '',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding reward:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetTypeChange = (value: string) => {
    setFormData({ ...formData, assetType: value as RewardAssetType });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Reward</DialogTitle>
          <DialogDescription>
            Add a new reward to the prize pool. Choose the asset type and configure reward details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-type">Asset Type</Label>
              <Select value={formData.assetType} onValueChange={handleAssetTypeChange}>
                <SelectTrigger id="asset-type">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ERC20">ERC20 (Fungible Token)</SelectItem>
                  <SelectItem value="ERC721">ERC721 (NFT)</SelectItem>
                  <SelectItem value="ERC1155">ERC1155 (Semi-Fungible)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="token-address">Token Contract Address</Label>
              <Input
                id="token-address"
                placeholder="0x..."
                value={formData.tokenAddress}
                onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="id-amount">
                {formData.assetType === 'ERC20' ? 'Amount (in wei)' : 'Token ID'}
              </Label>
              <Input
                id="id-amount"
                type="text"
                placeholder={formData.assetType === 'ERC20' ? '1000000000000000000' : '1'}
                value={formData.idOrAmount}
                onChange={(e) => setFormData({ ...formData, idOrAmount: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Reward Name</Label>
              <Input
                id="name"
                placeholder="e.g., 100 Gold Tokens"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the reward"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="weight">Weight (Probability Factor)</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                placeholder="10"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-gray-500">
                Higher weight = higher probability of being selected
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL (Optional)</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Reward
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
