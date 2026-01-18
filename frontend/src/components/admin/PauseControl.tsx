import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, ToggleRight } from 'lucide-react';
import { pauseContract, unpauseContract } from '@/services/adminSettings';
import { useToast } from '@/hooks/use-toast';

interface PauseControlProps {
  isPaused: boolean;
  onStatusChange: () => void;
}

export function PauseControl({ isPaused, onStatusChange }: PauseControlProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTogglePause = async () => {
    setLoading(true);
    try {
      const result = isPaused ? await unpauseContract() : await pauseContract();

      if (result.success) {
        toast({
          title: 'Success',
          description: `Contract ${isPaused ? 'resumed' : 'paused'} successfully`,
        });
        onStatusChange();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || `Failed to ${isPaused ? 'resume' : 'pause'} contract`,
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border-2 ${isPaused ? 'border-orange-500 bg-orange-50' : 'border-green-500 bg-green-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          {isPaused ? (
            <AlertCircle className="h-5 w-5 text-orange-600" />
          ) : (
            <ToggleRight className="h-5 w-5 text-green-600" />
          )}
          <p className={`font-semibold ${isPaused ? 'text-orange-900' : 'text-green-900'}`}>
            Contract Status: {isPaused ? 'PAUSED' : 'ACTIVE'}
          </p>
        </div>
        <p className={`text-sm ${isPaused ? 'text-orange-800' : 'text-green-800'}`}>
          {isPaused
            ? 'New reward boxes cannot be opened. Users can still withdraw pending rewards.'
            : 'Reward boxes are available for users to open.'}
        </p>
      </div>

      <Button
        onClick={handleTogglePause}
        disabled={loading}
        variant={isPaused ? 'default' : 'destructive'}
        className="w-full"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {isPaused ? 'Resume Contract' : 'Pause Contract'}
      </Button>

      {isPaused && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ Contract is paused. Users cannot open new reward boxes.
        </div>
      )}
    </div>
  );
}
