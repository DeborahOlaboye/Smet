import { Zap } from 'lucide-react';

interface VRFConfigProps {
  keyHash?: string;
  subId?: string;
  requestConfirmations?: number;
  gasLimit?: number;
}

export function VRFConfig({
  keyHash = '0x',
  subId = '0',
  requestConfirmations = 3,
  gasLimit = 250000,
}: VRFConfigProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Chainlink VRF Configuration</h3>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-600 mb-1">KEY HASH</p>
          <code className="text-sm font-mono text-gray-900 break-all">{keyHash}</code>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="bg-white rounded border border-gray-200 p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">SUBSCRIPTION ID</p>
            <p className="text-sm font-mono text-gray-900">{subId}</p>
          </div>

          <div className="bg-white rounded border border-gray-200 p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">REQUEST CONFIRMATIONS</p>
            <p className="text-sm font-mono text-gray-900">{requestConfirmations}</p>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-600 mb-1">CALLBACK GAS LIMIT</p>
          <p className="text-sm font-mono text-gray-900">{gasLimit.toLocaleString()} gas</p>
        </div>
      </div>

      <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded text-xs text-blue-800">
        ℹ️ VRF configuration is immutable after contract deployment
      </div>
    </div>
  );
}
