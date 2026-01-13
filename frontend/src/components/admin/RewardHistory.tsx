'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Package } from 'lucide-react';

export interface RewardHistoryEntry {
  id: string;
  action: 'claimed' | 'added' | 'edited' | 'refilled' | 'deleted';
  rewardName: string;
  user?: string;
  amount?: number;
  timestamp: Date;
}

interface RewardHistoryProps {
  entries: RewardHistoryEntry[];
}

export function RewardHistory({ entries }: RewardHistoryProps) {
  const getActionBadge = (action: RewardHistoryEntry['action']) => {
    switch (action) {
      case 'claimed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300" variant="outline">Claimed</Badge>;
      case 'added':
        return <Badge className="bg-green-100 text-green-800 border-green-300" variant="outline">Added</Badge>;
      case 'edited':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300" variant="outline">Edited</Badge>;
      case 'refilled':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300" variant="outline">Refilled</Badge>;
      case 'deleted':
        return <Badge className="bg-red-100 text-red-800 border-red-300" variant="outline">Deleted</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reward History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No history available</p>
            <p className="text-gray-400 text-xs mt-1">Activity will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Reward History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{getActionBadge(entry.action)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm">{entry.rewardName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {entry.user ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono">{entry.user.slice(0, 6)}...{entry.user.slice(-4)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.amount !== undefined ? (
                      <span className="text-sm font-medium">{entry.amount}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{formatTimestamp(entry.timestamp)}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
