import { useToast } from '@/hooks/useToast';
import { ToastAction } from '@/components/ui/ToastAction';

export function useAdminToasts() {
  const { success, error, warning, toast } = useToast();

  const notifyRewardAdded = (rewardName: string) => {
    success(
      'Reward Added',
      `${rewardName} has been added to the reward pool`
    );
  };

  const notifyRewardRemoved = (rewardName: string) => {
    warning(
      'Reward Removed',
      `${rewardName} has been removed from the reward pool`
    );
  };

  const notifyContractUpdate = (contractName: string) => {
    success(
      'Contract Updated',
      `${contractName} configuration has been updated`
    );
  };

  const notifyBulkAction = (action: string, count: number, onUndo?: () => void) => {
    toast({
      title: 'Bulk Action Complete',
      description: `${action} applied to ${count} items`,
      variant: 'success',
      action: onUndo ? (
        <ToastAction
          altText="Undo action"
          onClick={onUndo}
        >
          Undo
        </ToastAction>
      ) : undefined,
      duration: 10000
    });
  };

  const notifyPermissionChange = (user: string, role: string) => {
    success(
      'Permissions Updated',
      `${user} has been granted ${role} permissions`
    );
  };

  const notifySystemMaintenance = (message: string) => {
    warning(
      'System Maintenance',
      message
    );
  };

  const notifyError = (operation: string, details?: string) => {
    error(
      `${operation} Failed`,
      details || 'An unexpected error occurred. Please try again.'
    );
  };

  return {
    notifyRewardAdded,
    notifyRewardRemoved,
    notifyContractUpdate,
    notifyBulkAction,
    notifyPermissionChange,
    notifySystemMaintenance,
    notifyError
  };
}