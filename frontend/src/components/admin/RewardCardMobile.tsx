'use client';

import { AdminReward } from '@/services/adminRewards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, RefreshCw } from 'lucide-react';
import { rewardTypes } from '@/types/reward';

interface RewardCardMobileProps {
  reward: AdminReward;
  onEdit: (reward: AdminReward) => void;
  onDelete: (reward: AdminReward) => void;
  onRefill: (reward: AdminReward) => void;
}

export function RewardCardMobile({ reward, onEdit, onDelete, onRefill }: RewardCardMobileProps) {
  return (
    <Card className="mb-3">
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{reward.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{reward.description}</p>
            </div>
            {reward.isActive ? (
              <Badge className="bg-green-100 text-green-800 border-green-300 ml-2 flex-shrink-0" variant="outline">
                Active
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800 border-gray-300 ml-2 flex-shrink-0" variant="outline">
                Inactive
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Type:</span>
              <Badge
                className={`${rewardTypes[reward.type].color} ${rewardTypes[reward.type].border} ml-2`}
                variant="outline"
              >
                {rewardTypes[reward.type].name}
              </Badge>
            </div>
            <div>
              <span className="text-gray-500">Asset:</span>
              <Badge variant="secondary" className="ml-2">{reward.assetType}</Badge>
            </div>
            <div>
              <span className="text-gray-500">Probability:</span>
              <span className="ml-2 font-medium">{(reward.probability * 100).toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-gray-500">Stock:</span>
              <span className={`ml-2 font-medium ${reward.remaining === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {reward.remaining} / {reward.total}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRefill(reward)}
              className="flex-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refill
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(reward)}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(reward)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
