'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-900">Something went wrong</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
