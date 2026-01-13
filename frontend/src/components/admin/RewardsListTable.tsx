'use client';

import { AdminReward } from '@/services/adminRewards';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, RefreshCw } from 'lucide-react';
import { rewardTypes } from '@/types/reward';

interface RewardsListTableProps {
  rewards: AdminReward[];
  onEdit: (reward: AdminReward) => void;
  onDelete: (reward: AdminReward) => void;
  onRefill: (reward: AdminReward) => void;
}

export function RewardsListTable({ rewards, onEdit, onDelete, onRefill }: RewardsListTableProps) {
  if (rewards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">No rewards available</p>
        <p className="text-gray-400 text-xs mt-1">Click &quot;Add New Reward&quot; to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Asset Type</TableHead>
            <TableHead>Probability</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-gray-100 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{reward.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {reward.description}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={`${rewardTypes[reward.type].color} ${rewardTypes[reward.type].border}`}
                  variant="outline"
                >
                  {rewardTypes[reward.type].name}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{reward.assetType}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">{(reward.probability * 100).toFixed(2)}%</span>
              </TableCell>
              <TableCell>
                <span className={`text-sm font-medium ${reward.remaining === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {reward.remaining} / {reward.total}
                </span>
              </TableCell>
              <TableCell>
                {reward.isActive ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300" variant="outline">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 border-gray-300" variant="outline">
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRefill(reward)}
                    title="Refill Stock"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(reward)}
                    title="Edit Reward"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(reward)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete Reward"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
