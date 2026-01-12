'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6 sm:h-8 sm:w-8',
    lg: 'h-8 w-8 sm:h-12 sm:w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 sm:gap-3 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
      {text && (
        <p className="text-xs sm:text-sm text-gray-600 text-center">{text}</p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
}

export function LoadingOverlay({ isVisible, text = 'Loading...' }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 sm:p-8 shadow-xl max-w-xs w-full mx-4">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg aspect-square mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
      </div>
    </div>
  );
}