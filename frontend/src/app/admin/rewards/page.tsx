'use client';

import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminRewardsPage() {
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
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add New Reward
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Current Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              No rewards available. Click &quot;Add New Reward&quot; to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
