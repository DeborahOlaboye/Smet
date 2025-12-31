import React from 'react';
import { render, screen } from '@testing-library/react';
import { RewardCard } from '../RewardCard';

const sampleReward = { id: 'r1', name: 'Gold Coin', description: 'desc', image: '/coin.png', type: 'loot', total: 10, remaining: 5, probability: 0.1 };

describe('RewardCard - accessibility', () => {
  it('button has accessible label', () => {
    render(<RewardCard reward={sampleReward as any} />);
    const button = screen.getByRole('button', { name: /Open Reward/i });
    expect(button).toBeInTheDocument();
  });
});
