import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: '0xabc' })),
  usePrepareContractWrite: vi.fn(() => ({ config: undefined, error: undefined })),
  useContractWrite: vi.fn(() => ({ data: undefined, writeAsync: undefined, isLoading: false })),
  useWaitForTransaction: vi.fn(() => ({ isLoading: false, isSuccess: false, isError: false })),
}));

import { useSmetReward } from '../useSmetReward';

describe('useSmetReward', () => {
  it('throws when write is not ready', async () => {
    const { result } = renderHook(() => useSmetReward());
    await expect(result.current.openReward()).rejects.toThrow('Contract write not ready');
  });

  it('prepares args with paymentInNative and poolId', () => {
    const wagmi = require('wagmi');
    // Reset mock calls
    wagmi.usePrepareContractWrite.mockClear();

    renderHook(() => useSmetReward({ paymentInNative: false, poolId: 1 }));
    expect(wagmi.usePrepareContractWrite.mock.calls.length).toBeGreaterThan(0);

    // Inspect the last call to ensure args were passed through
    const lastCall = wagmi.usePrepareContractWrite.mock.calls[0][0];
    expect(lastCall.args).toEqual([false, 1]);
  });
});
