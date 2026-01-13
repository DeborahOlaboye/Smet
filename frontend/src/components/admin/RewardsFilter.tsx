'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface RewardsFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  assetTypeFilter: string;
  onAssetTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function RewardsFilter({
  searchTerm,
  onSearchChange,
  assetTypeFilter,
  onAssetTypeChange,
  statusFilter,
  onStatusChange,
}: RewardsFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search rewards..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={assetTypeFilter} onValueChange={onAssetTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Asset Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="ERC20">ERC20</SelectItem>
          <SelectItem value="ERC721">ERC721</SelectItem>
          <SelectItem value="ERC1155">ERC1155</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
