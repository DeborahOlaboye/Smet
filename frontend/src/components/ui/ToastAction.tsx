import { ToastActionElement } from '@/types/toast';

interface ToastActionProps extends ToastActionElement {
  className?: string;
}

export function ToastAction({ 
  children, 
  onClick, 
  altText, 
  className = '' 
}: ToastActionProps) {
  return (
    <button
      onClick={onClick}
      aria-label={altText}
      className={`
        inline-flex h-8 shrink-0 items-center justify-center rounded-md border 
        bg-transparent px-3 text-sm font-medium transition-colors 
        hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring 
        disabled:pointer-events-none disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}