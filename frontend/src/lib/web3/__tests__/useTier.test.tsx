import { renderHook } from '@testing-library/react';
import { useTier } from '../useTier';

vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof import('wagmi')>('wagmi');
  return {
    ...(actual as any),
    useAccount: () => ({ address: '0xabc' }),
    useContractRead: () => ({ data: 3, isLoading: false, isError: false }),
  };
});

test('useTier returns numeric tier from contract read', () => {
  const { result } = renderHook(() => useTier());
  expect(result.current.tier).toBe(3);
});
