'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Edit, Trash2, PackagePlus, Loader2, Search, X, RefreshCw } from 'lucide-react';
import { AdminReward, fetchAdminRewards, updateReward, deleteReward, refillRewardStock } from '@/services/adminRewards';
import { EditRewardDialog } from './EditRewardDialog';
import { DeleteRewardDialog } from './DeleteRewardDialog';
import { RefillStockDialog } from './RefillStockDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type SortField = 'id' | 'name' | 'type' | 'probability' | 'remaining' | 'status';
type SortOrder = 'asc' | 'desc';

interface SortState {
  field: SortField;
  order: SortOrder;
}

const ITEMS_PER_PAGE = 10;

export function RewardTable() {
  const [rewards, setRewards] = useState<AdminReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<SortState>({ field: 'id', order: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'outofstock'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');

  const [selectedReward, setSelectedReward] = useState<AdminReward | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refillDialogOpen, setRefillDialogOpen] = useState(false);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchAdminRewards();
      setRewards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rewards');
      console.error('Error loading rewards:', err);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    await loadRewards(true);
  };

  const getStatusDisplay = (reward: AdminReward) => {
    if (reward.remaining === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    }
    if (reward.isActive) {
      return { label: 'Active', color: 'bg-green-100 text-green-800' };
    }
    return { label: 'Inactive', color: 'bg-yellow-100 text-yellow-800' };
  };

  const sortRewards = (data: AdminReward[]) => {
    return [...data].sort((a, b) => {
      let aValue: any = a[sortState.field];
      let bValue: any = b[sortState.field];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortState.order === 'asc' ? comparison : -comparison;
    });
  };

  const filterRewards = (data: AdminReward[]) => {
    let filtered = data;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (reward) =>
          reward.name.toLowerCase().includes(searchLower) ||
          reward.id.toLowerCase().includes(searchLower) ||
          reward.description.toLowerCase().includes(searchLower) ||
          reward.type.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((reward) => {
        if (statusFilter === 'active') {
          return reward.isActive && reward.remaining > 0;
        }
        if (statusFilter === 'inactive') {
          return !reward.isActive;
        }
        if (statusFilter === 'outofstock') {
          return reward.remaining === 0;
        }
        return true;
      });
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((reward) => reward.type === typeFilter);
    }

    return filtered;
  };

  const filteredAndSorted = filterRewards(sortRewards(rewards));
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedRewards = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    setSortState((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  const handleEdit = async (params: any) => {
    try {
      await updateReward(params);
      await loadRewards();
    } catch (err) {
      console.error('Error updating reward:', err);
    }
  };

  const handleDelete = async (rewardId: string) => {
    try {
      await deleteReward(rewardId);
      await loadRewards();
    } catch (err) {
      console.error('Error deleting reward:', err);
    }
  };

  const handleRefill = async (rewardId: string, amount: number) => {
    try {
      await refillRewardStock(rewardId, amount);
      await loadRewards();
    } catch (err) {
      console.error('Error refilling stock:', err);
    }
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <TableHead
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {sortState.field === field && (
          sortState.order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-sm font-medium text-red-800">Error loading rewards</p>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <Button onClick={loadRewards} variant="outline" size="sm" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Rewards Management</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Manage rewards, stock levels, and probabilities</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID, name, type, or description... (Ctrl+K)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && searchTerm) {
                setSearchTerm('');
                setCurrentPage(1);
              }
            }}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search rewards"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Clear search"
              title="Clear search (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            <span className="text-xs font-semibold text-gray-600 w-full">Status:</span>
            {(['all', 'active', 'inactive', 'outofstock'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className="capitalize"
                aria-pressed={statusFilter === status}
                aria-label={`Filter by ${status === 'outofstock' ? 'out of stock' : status} status`}
              >
                {status === 'outofstock' ? 'Out of Stock' : status === 'all' ? 'All' : status}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by rarity">
            <span className="text-xs font-semibold text-gray-600 w-full">Rarity:</span>
            {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setTypeFilter(type);
                  setCurrentPage(1);
                }}
                className="capitalize"
                aria-pressed={typeFilter === type}
                aria-label={`Filter by ${type === 'all' ? 'all types' : type} rarity`}
              >
                {type === 'all' ? 'All Types' : type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <Table>
          <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <TableRow className="hover:bg-gray-100/50">
              <SortHeader field="id" label="ID" />
              <SortHeader field="name" label="Name" />
              <SortHeader field="type" label="Type" />
              <SortHeader field="probability" label="Probability" />
              <SortHeader field="remaining" label="Stock" />
              <SortHeader field="status" label="Status" />
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRewards.length > 0 ? (
              paginatedRewards.map((reward, idx) => {
                const status = getStatusDisplay(reward);
                return (
                  <TableRow key={reward.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <TableCell className="font-mono text-xs text-gray-600">{reward.id}</TableCell>
                    <TableCell className="font-medium text-gray-900">{reward.name}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        reward.type === 'common' ? 'bg-gray-100 text-gray-800' :
                        reward.type === 'rare' ? 'bg-blue-100 text-blue-800' :
                        reward.type === 'epic' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reward.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-700">{(reward.probability * 100).toFixed(2)}%</TableCell>
                    <TableCell className={`text-sm font-bold ${
                      reward.remaining === 0 ? 'text-red-600' : 
                      reward.remaining < 10 ? 'text-orange-600' : 'text-green-600'
                    }`}>{reward.remaining}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                          onClick={() => {
                            setSelectedReward(reward);
                            setEditDialogOpen(true);
                          }}
                          title="Edit reward"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-green-100"
                          onClick={() => {
                            setSelectedReward(reward);
                            setRefillDialogOpen(true);
                          }}
                          title="Refill stock"
                        >
                          <PackagePlus className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100"
                          onClick={() => {
                            setSelectedReward(reward);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete reward"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No rewards found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {paginatedRewards.length > 0 ? (
          paginatedRewards.map((reward) => {
            const status = getStatusDisplay(reward);
            return (
              <div key={reward.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-xs font-mono text-gray-500 mb-1">ID: {reward.id}</p>
                    <h3 className="font-semibold text-sm text-gray-900">{reward.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        reward.type === 'common' ? 'bg-gray-100 text-gray-800' :
                        reward.type === 'rare' ? 'bg-blue-100 text-blue-800' :
                        reward.type === 'epic' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reward.type}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${status.color}`}>{status.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs mb-3 p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-gray-500 text-xs">Probability:</span>
                    <span className="ml-1 font-bold block text-gray-900">{(reward.probability * 100).toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Stock:</span>
                    <span className={`ml-1 font-bold block ${
                      reward.remaining === 0 ? 'text-red-600' : 
                      reward.remaining < 10 ? 'text-orange-600' : 'text-green-600'
                    }`}>{reward.remaining}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedReward(reward);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => {
                      setSelectedReward(reward);
                      setRefillDialogOpen(true);
                    }}
                  >
                    <PackagePlus className="h-4 w-4 mr-2" />
                    Refill
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setSelectedReward(reward);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">No rewards found</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 p-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredAndSorted.length)} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSorted.length)} of {filteredAndSorted.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  const distance = Math.abs(page - currentPage);
                  return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                })
                .map((page, idx, arr) => (
                  <div key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1 text-gray-400">...</span>}
                    <Button
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialogs */}
      <EditRewardDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} reward={selectedReward} onEdit={handleEdit} />
      <DeleteRewardDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} reward={selectedReward} onDelete={handleDelete} />
      <RefillStockDialog open={refillDialogOpen} onOpenChange={setRefillDialogOpen} reward={selectedReward} onRefill={handleRefill} />
    </div>
  );
}