import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToast } from '../useToast';
import { Toaster } from '@/components/ui/Toaster';

function TestComponent() {
  const { success, error, warning, info } = useToast();

  return (
    <div>
      <button onClick={() => success('Success', 'Operation completed')}>
        Success Toast
      </button>
      <button onClick={() => error('Error', 'Something went wrong')}>
        Error Toast
      </button>
      <button onClick={() => warning('Warning', 'Please be careful')}>
        Warning Toast
      </button>
      <button onClick={() => info('Info', 'Just so you know')}>
        Info Toast
      </button>
    </div>
  );
}

function ToastTestWrapper() {
  return (
    <ToastProvider>
      <TestComponent />
      <Toaster />
    </ToastProvider>
  );
}

describe('Toast System', () => {
  it('renders success toast correctly', async () => {
    render(<ToastTestWrapper />);
    
    fireEvent.click(screen.getByText('Success Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });
  });

  it('renders error toast correctly', async () => {
    render(<ToastTestWrapper />);
    
    fireEvent.click(screen.getByText('Error Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('allows dismissing toasts', async () => {
    render(<ToastTestWrapper />);
    
    fireEvent.click(screen.getByText('Success Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    const dismissButton = screen.getByLabelText('Close');
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });
  });

  it('auto-dismisses toasts after duration', async () => {
    vi.useFakeTimers();
    
    render(<ToastTestWrapper />);
    
    fireEvent.click(screen.getByText('Info Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText('Info')).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('displays multiple toasts simultaneously', async () => {
    render(<ToastTestWrapper />);
    
    fireEvent.click(screen.getByText('Success Toast'));
    fireEvent.click(screen.getByText('Error Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });
});