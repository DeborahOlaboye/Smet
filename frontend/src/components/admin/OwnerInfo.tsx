import { Copy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface OwnerInfoProps {
  owner: string;
  label?: string;
}

export function OwnerInfo({ owner, label = 'Owner' }: OwnerInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(owner);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDisplayAddress = () => {
    if (!owner || owner === '0x0000000000000000000000000000000000000000') {
      return 'Not set';
    }
    return owner;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <User className="h-4 w-4 text-gray-600" />
        <p className="text-sm font-semibold text-gray-700">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-white border rounded px-3 py-2 text-sm font-mono break-all">
          {getDisplayAddress()}
        </code>
        {owner && owner !== '0x0000000000000000000000000000000000000000' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy address'}
            className="flex-shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
