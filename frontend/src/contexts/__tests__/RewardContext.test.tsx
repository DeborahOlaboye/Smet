import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/web3/useSmetReward', () => ({
  useSmetReward: vi.fn(() => ({
    openReward: vi.fn(async () => ({ hash: '0xtx' })),
    estimateGas: vi.fn(async () => '21000'),
    isLoading: false,
    isSuccess: false,
    error: null,
  })),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import { RewardProvider, useRewards } from '../RewardContext';

function wrapper({ children }: { children?: React.ReactNode }) {
  return <RewardProvider>{children}</RewardProvider>;
}

describe('RewardContext', () => {
  it('opens a reward and sets txHash', async () => {
    const { result } = renderHook(() => useRewards(), { wrapper });

    await act(async () => {
      await result.current.openReward('id');
    });

    expect(result.current.txHash).toBe('0xtx');
  });
});
