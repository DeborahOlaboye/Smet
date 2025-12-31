import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RewardCard } from '../RewardCard';

const sampleReward = {
  id: 'r1',
  name: 'Gold Coin',
  description: 'Shiny gold coin',
  image: '/coin.png',
  type: 'loot',
  total: 100,
  remaining: 42,
  probability: 0.05
};

describe('RewardCard - unit', () => {
  it('renders reward details and button', () => {
    const onOpen = jest.fn();
    render(<RewardCard reward={sampleReward as any} onOpen={onOpen} />);

    expect(screen.getByText(/Gold Coin/i)).toBeInTheDocument();
    expect(screen.getByText(/Shiny gold coin/i)).toBeInTheDocument();
    expect(screen.getByText(/Chance:/i)).toBeInTheDocument();
    expect(screen.getByText(/42\/100 left/i)).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /Open Reward/i });
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledWith('r1');
  });

  it('shows sold out when remaining is 0 and disables button', () => {
    const onOpen = jest.fn();
    const soldOut = { ...sampleReward, remaining: 0 };
    render(<RewardCard reward={soldOut as any} onOpen={onOpen} />);

    expect(screen.getByRole('button', { name: /Sold out/i })).toBeDisabled();
  });
});
