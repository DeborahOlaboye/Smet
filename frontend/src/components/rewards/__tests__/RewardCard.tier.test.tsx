import React from 'react';
import { render, screen } from '@testing-library/react';
import { RewardCard } from '../RewardCard';

vi.mock('@/lib/web3/useTier', () => ({
  useTier: () => ({ tier: 3, isLoading: false, isError: false }),
}));

test('RewardCard shows tier badge when tier present', () => {
  const reward = {
    id: '1',
    type: 1,
    name: 'Test',
    image: '/test.png',
    description: 'desc',
    probability: 0.5,
    remaining: 1,
    total: 1,
  } as any;

  render(<RewardCard reward={reward} />);
  expect(screen.getByText(/Gold/i)).toBeTruthy();
});
