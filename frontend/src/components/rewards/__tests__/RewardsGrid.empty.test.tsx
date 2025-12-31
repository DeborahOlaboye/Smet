import React from 'react';
import { render, screen } from '@testing-library/react';
import { RewardsGrid } from '../RewardsGrid';

describe('RewardsGrid - empty state', () => {
  it('shows no rewards available message when list is empty and not loading', () => {
    render(<RewardsGrid rewards={[]} onOpenReward={() => {}} isLoading={false} />);
    expect(screen.getByText(/No rewards available/i)).toBeInTheDocument();
  });
});
