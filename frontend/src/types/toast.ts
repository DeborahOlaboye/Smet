export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastActionElement {
  altText: string;
  onClick: () => void;
  children: React.ReactNode;
}