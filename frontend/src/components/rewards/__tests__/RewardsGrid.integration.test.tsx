import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RewardsGrid } from '../RewardsGrid';

const rewards = [
  { id: 'r1', name: 'A', description: 'a', image: '/a.png', type: 'loot', total: 10, remaining: 5, probability: 0.1 },
  { id: 'r2', name: 'B', description: 'b', image: '/b.png', type: 'loot', total: 10, remaining: 3, probability: 0.2 }
];

describe('RewardsGrid - integration', () => {
  it('renders multiple reward cards and triggers open', () => {
    const onOpen = jest.fn();
    render(<RewardsGrid rewards={rewards as any} onOpenReward={onOpen} isLoading={false} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();

    // click open on first card
    const buttons = screen.getAllByRole('button', { name: /Open Reward/i });
    fireEvent.click(buttons[0]);
    expect(onOpen).toHaveBeenCalledWith('r1');
  });

  it('shows placeholders when loading', () => {
    render(<RewardsGrid rewards={[]} onOpenReward={() => {}} isLoading={true} />);
    const placeholders = screen.getAllByRole('button', { name: /Opening.../i });
    expect(placeholders.length).toBeGreaterThan(0);
  });
});
