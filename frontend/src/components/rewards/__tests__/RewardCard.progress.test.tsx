import React from 'react';
import { render } from '@testing-library/react';
import { RewardCard } from '../RewardCard';

const reward = { id: 'r1', name: 'Gold', description: 'desc', image: '/g.png', type: 'loot', total: 100, remaining: 25, probability: 0.5 };

describe('RewardCard - progress bar', () => {
  it('renders progress bar with expected width', () => {
    const { container } = render(<RewardCard reward={reward as any} />);
    const inner = container.querySelector('.bg-[var(--primary)]');
    // remainingPercentage = Math.round((25/100) * 100) => 25
    expect(inner).toHaveStyle('width: 25%');
  });
});
