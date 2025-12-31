import React from 'react';
import { render, screen } from '@testing-library/react';
import { RewardCard } from '../RewardCard';

const reward = { id: 'r1', name: 'Gold', description: 'desc', image: '/g.png', type: 'loot', total: 10, remaining: 5, probability: 0.1234 };

describe('RewardCard - probability display', () => {
  it('displays probability as percentage with one decimal place', () => {
    render(<RewardCard reward={reward as any} />);
    expect(screen.getByText(/Chance: 12.3%/i)).toBeInTheDocument();
  });
});
