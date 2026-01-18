import { CheckCircle2, AlertCircle } from 'lucide-react';

interface NetworkStatusProps {
  chainId: number;
  chainName: string;
  isConnected: boolean;
}

export function NetworkStatus({ chainId, chainName, isConnected }: NetworkStatusProps) {
  const expectedChainId = 4242; // Lisk Sepolia
  const isCorrectNetwork = chainId === expectedChainId;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isConnected && isCorrectNetwork
          ? 'border-green-500 bg-green-50'
          : 'border-red-500 bg-red-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {isConnected && isCorrectNetwork ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p
            className={`font-semibold ${
              isConnected && isCorrectNetwork ? 'text-green-900' : 'text-red-900'
            }`}
          >
            {isConnected && isCorrectNetwork ? 'Network Connected' : 'Network Error'}
          </p>
          <p className={`text-sm mt-1 ${isConnected && isCorrectNetwork ? 'text-green-800' : 'text-red-800'}`}>
            {isConnected ? (
              <>
                {isCorrectNetwork ? (
                  <>Connected to {chainName} (Chain ID: {chainId})</>
                ) : (
                  <>Wrong network. Expected Chain ID {expectedChainId}, got {chainId}</>
                )}
              </>
            ) : (
              <>Wallet not connected</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
