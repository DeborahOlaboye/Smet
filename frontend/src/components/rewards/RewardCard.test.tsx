import { render, screen } from '@testing-library/react';
import { RewardCard } from './RewardCard';

const reward = {
  id: 'r1',
  name: 'Test Reward',
  description: 'Desc',
  image: '/placeholder.svg',
  type: 'loot',
  total: 10,
  remaining: 5,
  probability: 0.5,
};

test('RewardCard shows Opening... when loading', () => {
  render(<RewardCard reward={reward as any} onOpen={() => {}} isLoading={true} />);
  expect(screen.getByText(/opening/i)).toBeInTheDocument();
});

test('RewardCard shows Open Reward when not loading', () => {
  render(<RewardCard reward={reward as any} onOpen={() => {}} isLoading={false} />);
  expect(screen.getByText(/open reward/i)).toBeInTheDocument();
});
