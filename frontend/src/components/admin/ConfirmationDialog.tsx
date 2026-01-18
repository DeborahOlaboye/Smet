import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  actionLabel = 'Confirm',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isDangerous ? 'text-red-600' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h3 className={`font-semibold ${isDangerous ? 'text-red-900' : 'text-gray-900'}`}>
              {title}
            </h3>
            <p className={`text-sm mt-1 ${isDangerous ? 'text-red-800' : 'text-gray-700'}`}>
              {description}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant={isDangerous ? 'destructive' : 'default'}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
