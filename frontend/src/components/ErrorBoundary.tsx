'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-x-4">
              <Button
                onClick={this.handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="ml-2"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType<{ error: Error | null; reset: () => void }>
) {
  return function WithErrorBoundary(props: T) {
    return (
      <ErrorBoundary
        fallback={
          FallbackComponent ? (
            <FallbackComponent
              error={null}
              reset={() => window.location.reload()}
            />
          ) : undefined
        }
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
