import { useToast } from '@/hooks/useToast';
import { ToastAction } from '@/components/ui/ToastAction';

export function useTransactionToasts() {
  const { success, error, info, toast } = useToast();

  const notifyTransactionSubmitted = (txHash: string) => {
    toast({
      title: 'Transaction Submitted',
      description: 'Your transaction has been submitted to the blockchain',
      variant: 'default',
      action: (
        <ToastAction
          altText="View transaction"
          onClick={() => window.open(`https://sepolia-blockscout.lisk.com/tx/${txHash}`, '_blank')}
        >
          View
        </ToastAction>
      ),
      duration: 8000
    });
  };

  const notifyTransactionConfirmed = (txHash: string, description?: string) => {
    toast({
      title: 'Transaction Confirmed',
      description: description || 'Your transaction has been confirmed on the blockchain',
      variant: 'success',
      action: (
        <ToastAction
          altText="View transaction"
          onClick={() => window.open(`https://sepolia-blockscout.lisk.com/tx/${txHash}`, '_blank')}
        >
          View
        </ToastAction>
      ),
      duration: 10000
    });
  };

  const notifyTransactionFailed = (reason?: string) => {
    error(
      'Transaction Failed',
      reason || 'Your transaction failed to execute. Please try again.'
    );
  };

  const notifyInsufficientGas = () => {
    error(
      'Insufficient Gas',
      'Transaction failed due to insufficient gas. Try increasing the gas limit.'
    );
  };

  const notifyNetworkCongestion = () => {
    info(
      'Network Congestion',
      'Network is busy. Your transaction may take longer than usual.'
    );
  };

  const notifyApprovalRequired = (tokenName: string) => {
    info(
      'Approval Required',
      `Please approve ${tokenName} spending in your wallet to continue.`
    );
  };

  return {
    notifyTransactionSubmitted,
    notifyTransactionConfirmed,
    notifyTransactionFailed,
    notifyInsufficientGas,
    notifyNetworkCongestion,
    notifyApprovalRequired
  };
}