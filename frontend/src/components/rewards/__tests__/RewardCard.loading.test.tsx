import React from 'react';
import { render, screen } from '@testing-library/react';
import { RewardCard } from '../RewardCard';

const ph = { id: 'ph-1', name: '', description: '', image: '/placeholder.png', type: 'loot', total: 1, remaining: 1, probability: 0 };

describe('RewardCard - loading', () => {
  it('renders skeletons and disables button while loading', () => {
    render(<RewardCard reward={ph as any} isLoading={true} />);

    expect(screen.getByText(/Opening.../i)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /Opening.../i });
    expect(button).toBeDisabled();
  });
});
