import { useState } from 'react';
import { OwnedAsset } from '@/types/dashboard';
import { AssetDetailModal } from './AssetDetailModal';

interface AssetsGalleryProps {
  assets: OwnedAsset[];
  isLoading: boolean;
}

export function AssetsGallery({ assets, isLoading }: AssetsGalleryProps) {
  const [selectedAsset, setSelectedAsset] = useState<OwnedAsset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssetClick = (asset: OwnedAsset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  };
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎭</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Yet</h3>
        <p className="text-gray-600">Open some reward boxes to collect heroes and loot!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {assets.map((asset) => (
        <div 
          key={`${asset.type}-${asset.tokenId}`} 
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleAssetClick(asset)}
        >
          <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
            {asset.image ? (
              <img
                src={asset.image}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                {asset.type === 'hero' ? '🦸' : '⚔️'}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{asset.name}</h3>
            <p className="text-sm text-gray-600 mb-2">#{asset.tokenId}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded-full ${
                asset.type === 'hero' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {asset.type === 'hero' ? 'Hero' : 'Loot'}
              </span>
            </div>
          </div>
        </div>
      ))}
      <AssetDetailModal
        asset={selectedAsset}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}