import { Info } from 'lucide-react';
import { formatEther } from 'viem';

interface FeeDisplayProps {
  fee: bigint;
  isImmutable?: boolean;
}

export function FeeDisplay({ fee, isImmutable = true }: FeeDisplayProps) {
  const feeInEth = formatEther(fee);
  const feeInWei = fee.toString();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-3">Current Box Opening Fee</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-2xl font-bold text-blue-900">{feeInEth} ETH</p>
              <p className="text-xs text-blue-700 mt-1">Displayed in Ether</p>
            </div>
            <div>
              <p className="text-lg font-mono text-blue-900 break-all">{feeInWei}</p>
              <p className="text-xs text-blue-700 mt-1">Wei value</p>
            </div>
          </div>
          {isImmutable && (
            <p className="text-xs text-blue-700 mt-3 border-t border-blue-200 pt-3">
              🔒 This fee is immutable and set during contract deployment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
