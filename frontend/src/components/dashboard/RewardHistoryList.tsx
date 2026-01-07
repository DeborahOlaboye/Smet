import { RewardHistory } from '@/types/dashboard';

interface RewardHistoryListProps {
  history: RewardHistory[];
  isLoading: boolean;
}

export function RewardHistoryList({ history, isLoading }: RewardHistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📜</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reward History</h3>
        <p className="text-gray-600">Your reward opening history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((reward) => (
        <div key={reward.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                reward.rewardType === 'SmetGold' ? 'bg-yellow-500' :
                reward.rewardType === 'SmetHero' ? 'bg-purple-500' : 'bg-blue-500'
              }`}>
                {reward.rewardType === 'SmetGold' ? '🪙' :
                 reward.rewardType === 'SmetHero' ? '🦸' : '⚔️'}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {reward.rewardType} {reward.tokenId ? `#${reward.tokenId}` : ''}
                </h4>
                <p className="text-sm text-gray-600">
                  Amount: {reward.amount}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(reward.timestamp * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
            <a
              href={`https://sepolia-blockscout.lisk.com/tx/${reward.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View Tx
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}