import { OwnedAsset } from '@/types/dashboard';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

interface AssetDetailModalProps {
  asset: OwnedAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetDetailModal({ asset, isOpen, onClose }: AssetDetailModalProps) {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">{asset.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {asset.image ? (
              <img
                src={asset.image}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {asset.type === 'hero' ? '🦸' : '⚔️'}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Token ID</h3>
              <p className="text-gray-600">#{asset.tokenId}</p>
            </div>

            {asset.description && (
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                <p className="text-gray-600 text-sm">{asset.description}</p>
              </div>
            )}

            {asset.attributes && asset.attributes.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Attributes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {asset.attributes.map((attr, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">{attr.trait_type}</p>
                      <p className="text-sm font-medium">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <a
                href={`https://sepolia-blockscout.lisk.com/token/${
                  asset.type === 'hero' ? CONTRACT_ADDRESSES.SmetHero : CONTRACT_ADDRESSES.SmetLoot
                }/instance/${asset.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View on Explorer →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}