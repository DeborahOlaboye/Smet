'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

// Mock data - replace with actual data from your API
const mockRewards = [
  { id: '1', name: 'Golden Sword', type: 'Legendary', status: 'Active', claims: 45, remaining: 55 },
  { id: '2', name: 'Magic Potion', type: 'Common', status: 'Active', claims: 120, remaining: 80 },
  { id: '3', name: 'Dragon Shield', type: 'Epic', status: 'Paused', claims: 23, remaining: 77 },
  { id: '4', name: 'Health Elixir', type: 'Common', status: 'Active', claims: 89, remaining: 11 },
  { id: '5', name: 'Mystic Gem', type: 'Rare', status: 'Active', claims: 67, remaining: 33 },
];

export function RewardTable() {
  const [selectedReward, setSelectedReward] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {mockRewards.map((reward) => (
          <div key={reward.id} className="border rounded-lg p-4 bg-white">
            <div className=\"flex justify-between items-start mb-2\">
              <div>
                <h3 className=\"font-medium text-sm\">{reward.name}</h3>
                <p className=\"text-xs text-gray-500\">{reward.type}</p>
              </div>
              <div className=\"flex items-center gap-2\">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  reward.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {reward.status}
                </span>
                <Button variant=\"ghost\" size=\"sm\" className=\"h-8 w-8 p-0\">
                  <MoreHorizontal className=\"h-4 w-4\" />
                </Button>
              </div>
            </div>
            <div className=\"grid grid-cols-2 gap-4 text-xs\">
              <div>
                <span className=\"text-gray-500\">Claims:</span>
                <span className=\"ml-1 font-medium\">{reward.claims}</span>
              </div>
              <div>
                <span className=\"text-gray-500\">Remaining:</span>
                <span className=\"ml-1 font-medium\">{reward.remaining}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className=\"hidden sm:block overflow-x-auto\">
        <table className=\"w-full\">
          <thead>
            <tr className=\"border-b text-left\">
              <th className=\"pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider\">Name</th>
              <th className=\"pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider\">Type</th>
              <th className=\"pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider\">Status</th>
              <th className=\"pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider\">Claims</th>
              <th className=\"pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider\">Remaining</th>
              <th className=\"pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider\">Actions</th>
            </tr>
          </thead>
          <tbody className=\"divide-y\">
            {mockRewards.map((reward) => (
              <tr key={reward.id} className=\"hover:bg-gray-50\">
                <td className=\"py-4 text-sm font-medium text-gray-900\">{reward.name}</td>
                <td className=\"py-4 text-sm text-gray-500\">{reward.type}</td>
                <td className=\"py-4\">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    reward.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reward.status}
                  </span>
                </td>
                <td className=\"py-4 text-sm text-gray-500\">{reward.claims}</td>
                <td className=\"py-4 text-sm text-gray-500\">{reward.remaining}</td>
                <td className=\"py-4\">
                  <div className=\"flex items-center gap-2\">
                    <Button variant=\"ghost\" size=\"sm\" className=\"h-8 w-8 p-0\">
                      <Eye className=\"h-4 w-4\" />
                    </Button>
                    <Button variant=\"ghost\" size=\"sm\" className=\"h-8 w-8 p-0\">
                      <Edit className=\"h-4 w-4\" />
                    </Button>
                    <Button variant=\"ghost\" size=\"sm\" className=\"h-8 w-8 p-0 text-red-600 hover:text-red-700\">
                      <Trash2 className=\"h-4 w-4\" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}