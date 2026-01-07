import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatsOverview } from '../StatsOverview';
import { UserStats } from '@/types/dashboard';

const mockStats: UserStats = {
  totalSpent: '1000000000000000000',
  boxesOpened: 5,
  totalRewardsWon: 8,
  smetGoldBalance: '2500000000000000000000',
  heroesOwned: 3,
  lootItemsOwned: 2,
};

describe('StatsOverview', () => {
  it('renders loading state correctly', () => {
    render(<StatsOverview stats={null} isLoading={true} />);
    
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders stats correctly when loaded', () => {
    render(<StatsOverview stats={mockStats} isLoading={false} />);
    
    expect(screen.getByText('2500 GOLD')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('returns null when no stats and not loading', () => {
    const { container } = render(<StatsOverview stats={null} isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });
});