import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, Copy } from 'lucide-react';
import { setTimelock } from '@/services/adminSettings';
import { useToast } from '@/hooks/use-toast';

interface TimelockManagerProps {
  currentTimelock: string;
  onUpdate: () => void;
}

export function TimelockManager({ currentTimelock, onUpdate }: TimelockManagerProps) {
  const [newTimelock, setNewTimelock] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyAddress = () => {
    if (currentTimelock) {
      navigator.clipboard.writeText(currentTimelock);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSetTimelock = async () => {
    if (!newTimelock.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid address',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await setTimelock(newTimelock);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Timelock address updated successfully',
        });
        setNewTimelock('');
        onUpdate();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to update timelock',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p className="font-semibold mb-1">ℹ️ Timelock Function</p>
        <p>Timelock contract manages critical contract changes with a delay period for security.</p>
      </div>

      {currentTimelock && currentTimelock !== '0x0000000000000000000000000000000000000000' ? (
        <div className="bg-gray-50 border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Current Timelock Address</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border rounded px-3 py-2 text-sm font-mono truncate">
              {currentTimelock}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyAddress}
              title={copied ? 'Copied!' : 'Copy address'}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          ⚠️ No timelock address is set
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">New Timelock Address</label>
        <div className="flex gap-2">
          <Input
            placeholder="0x..."
            value={newTimelock}
            onChange={(e) => setNewTimelock(e.target.value)}
            disabled={loading}
            className="font-mono"
          />
          <Button onClick={handleSetTimelock} disabled={loading} className="whitespace-nowrap">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Update
          </Button>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
        <p className="font-semibold mb-1">⚠️ Critical Change</p>
        <p>Updating the timelock address requires careful consideration. Ensure the new address is valid.</p>
      </div>
    </div>
  );
}
