# Issue #91 - Testing Guide: Admin Statistics Page

## Overview

This guide provides comprehensive testing strategies for the admin statistics page, including unit tests, integration tests, and end-to-end testing approaches.

## Test Structure

```
frontend/src/
├── __tests__/
│   ├── services/
│   │   └── statistics.test.ts
│   └── components/
│       └── admin/
│           ├── StatsCard.test.tsx
│           ├── TimeSeriesChart.test.tsx
│           ├── RewardDistributionChart.test.tsx
│           ├── MostPopularRewardsCard.test.tsx
│           └── UserEngagementMetrics.test.tsx
└── ...
```

## Unit Tests

### StatisticsService Tests

```typescript
// frontend/src/__tests__/services/statistics.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatisticsService, StatisticsData } from '@/services/statistics';
import * as viem from 'viem';

describe('StatisticsService', () => {
  let publicClientMock: any;

  beforeEach(() => {
    publicClientMock = {
      getLogs: vi.fn(),
      getBlock: vi.fn(),
    };
    
    // Mock viem publicClient
    vi.mock('viem', () => ({
      createPublicClient: () => publicClientMock,
    }));
  });

  describe('getOpenedEvents', () => {
    it('should fetch and return opened events with timestamps', async () => {
      const mockLogs = [
        {
          blockNumber: 1000n,
          args: {
            opener: '0x123...',
            reqId: 1n,
          },
        },
      ];

      const mockBlock = {
        timestamp: 1700000000n,
      };

      publicClientMock.getLogs.mockResolvedValue(mockLogs);
      publicClientMock.getBlock.mockResolvedValue(mockBlock);

      const events = await StatisticsService.getOpenedEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toHaveProperty('opener');
      expect(events[0]).toHaveProperty('timestamp');
      expect(events[0]).toHaveProperty('blockNumber');
    });

    it('should handle empty event list', async () => {
      publicClientMock.getLogs.mockResolvedValue([]);

      const events = await StatisticsService.getOpenedEvents();

      expect(events).toEqual([]);
    });

    it('should handle RPC errors gracefully', async () => {
      publicClientMock.getLogs.mockRejectedValue(new Error('RPC Error'));

      const events = await StatisticsService.getOpenedEvents();

      expect(events).toEqual([]);
    });

    it('should fetch from specified block range', async () => {
      publicClientMock.getLogs.mockResolvedValue([]);

      await StatisticsService.getOpenedEvents(1000n);

      expect(publicClientMock.getLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          fromBlock: 1000n,
        })
      );
    });
  });

  describe('getRewardOutEvents', () => {
    it('should fetch reward distribution events', async () => {
      const mockLogs = [
        {
          blockNumber: 1001n,
          args: {
            opener: '0x456...',
            reward: {
              assetType: 1,
              token: '0xabc...',
              idOrAmount: 1000n,
            },
          },
        },
      ];

      publicClientMock.getLogs.mockResolvedValue(mockLogs);
      publicClientMock.getBlock.mockResolvedValue({
        timestamp: 1700000100n,
      });

      const rewards = await StatisticsService.getRewardOutEvents();

      expect(rewards).toHaveLength(1);
      expect(rewards[0]).toHaveProperty('tokenType');
      expect(rewards[0]).toHaveProperty('amount');
    });
  });

  describe('getTotalFeesCollected', () => {
    it('should calculate total fees from opened events', async () => {
      // Mock implementation based on fee calculation logic
      const totalFees = await StatisticsService.getTotalFeesCollected();

      expect(typeof totalFees).toBe('bigint');
      expect(totalFees).toBeGreaterThanOrEqual(0n);
    });
  });

  describe('getStatistics', () => {
    it('should return complete statistics data', async () => {
      // Mock both event types
      publicClientMock.getLogs.mockResolvedValue([]);
      publicClientMock.getBlock.mockResolvedValue({
        timestamp: 1700000000n,
      });

      const stats = await StatisticsService.getStatistics();

      expect(stats).toHaveProperty('totalBoxesOpened');
      expect(stats).toHaveProperty('totalFeesCollected');
      expect(stats).toHaveProperty('uniqueUsers');
      expect(stats).toHaveProperty('rewardDistribution');
      expect(stats).toHaveProperty('mostPopularRewards');
      expect(stats).toHaveProperty('userEngagementMetrics');
      expect(stats).toHaveProperty('dailyStats');
      expect(stats).toHaveProperty('weeklyStats');
      expect(stats).toHaveProperty('monthlyStats');
    });

    it('should calculate unique users correctly', async () => {
      // Mock data with duplicate users
      const mockLogs = [
        { blockNumber: 1000n, args: { opener: '0x123...', reqId: 1n } },
        { blockNumber: 1001n, args: { opener: '0x123...', reqId: 2n } },
        { blockNumber: 1002n, args: { opener: '0x456...', reqId: 3n } },
      ];

      publicClientMock.getLogs.mockResolvedValue(mockLogs);
      publicClientMock.getBlock.mockResolvedValue({
        timestamp: 1700000000n,
      });

      const stats = await StatisticsService.getStatistics();

      expect(stats.uniqueUsers).toBe(2);
    });

    it('should calculate reward distribution correctly', async () => {
      const stats = await StatisticsService.getStatistics();

      expect(typeof stats.rewardDistribution).toBe('object');
      Object.values(stats.rewardDistribution).forEach(count => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThan(0);
      });
    });

    it('should handle large event datasets', async () => {
      // Create mock for 10,000 events
      const largeEventSet = Array.from({ length: 10000 }, (_, i) => ({
        blockNumber: BigInt(1000 + i),
        args: {
          opener: `0x${i % 1000}...`, // 1000 unique users
          reqId: BigInt(i),
        },
      }));

      publicClientMock.getLogs.mockResolvedValue(largeEventSet);

      const startTime = performance.now();
      const stats = await StatisticsService.getStatistics();
      const duration = performance.now() - startTime;

      expect(stats.totalBoxesOpened).toBe(10000);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });
  });
});
```

### Component Tests

#### StatsCard Test

```typescript
import { render, screen } from '@testing-library/react';
import { StatsCard } from '@/components/admin/StatsCard';
import { Package } from 'lucide-react';

describe('StatsCard', () => {
  it('should render title and value', () => {
    render(
      <StatsCard
        title="Total Boxes"
        value={1234}
        icon={Package}
      />
    );

    expect(screen.getByText('Total Boxes')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    const { container } = render(
      <StatsCard
        title="Metric"
        value={100}
        icon={Package}
      />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should display trend indicator', () => {
    render(
      <StatsCard
        title="Metric"
        value={100}
        trend="up"
        trendValue="+10%"
      />
    );

    expect(screen.getByText('+10%')).toBeInTheDocument();
  });
});
```

#### TimeSeriesChart Test

```typescript
import { render, screen } from '@testing-library/react';
import { TimeSeriesChart } from '@/components/admin/TimeSeriesChart';

describe('TimeSeriesChart', () => {
  const mockData = [
    { label: '2024-01-01', value: 100 },
    { label: '2024-01-02', value: 150 },
    { label: '2024-01-03', value: 120 },
  ];

  it('should render chart title', () => {
    render(
      <TimeSeriesChart
        title="Daily Openings"
        data={mockData}
      />
    );

    expect(screen.getByText('Daily Openings')).toBeInTheDocument();
  });

  it('should render all data points', () => {
    render(
      <TimeSeriesChart
        title="Chart"
        data={mockData}
      />
    );

    mockData.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('should handle empty data', () => {
    render(
      <TimeSeriesChart
        title="Chart"
        data={[]}
      />
    );

    expect(screen.getByText('Chart')).toBeInTheDocument();
  });
});
```

#### UserEngagementMetrics Test

```typescript
import { render, screen } from '@testing-library/react';
import { UserEngagementMetrics } from '@/components/admin/UserEngagementMetrics';

describe('UserEngagementMetrics', () => {
  const mockMetrics = {
    dailyActiveUsers: 50,
    weeklyActiveUsers: 200,
    monthlyActiveUsers: 1000,
    averageClaimsPerUser: 2.5,
  };

  it('should render all metric cards', () => {
    render(<UserEngagementMetrics data={mockMetrics} />);

    expect(screen.getByText('Daily Active Users')).toBeInTheDocument();
    expect(screen.getByText('Weekly Active Users')).toBeInTheDocument();
    expect(screen.getByText('Monthly Active Users')).toBeInTheDocument();
    expect(screen.getByText('Avg Claims Per User')).toBeInTheDocument();
  });

  it('should display correct metric values', () => {
    render(<UserEngagementMetrics data={mockMetrics} />);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('2.50')).toBeInTheDocument();
  });
});
```

## Integration Tests

### Statistics Page Integration Test

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import StatisticsPage from '@/app/admin/statistics/page';
import * as statisticsService from '@/services/statistics';

// Mock the statistics service
vi.mock('@/services/statistics', () => ({
  StatisticsService: {
    getStatistics: vi.fn(),
  },
}));

describe('Statistics Page Integration', () => {
  const mockStatistics = {
    totalBoxesOpened: 1000,
    totalFeesCollected: 100000n,
    uniqueUsers: 500,
    rewardDistribution: {
      '0xtoken1': 600,
      '0xtoken2': 400,
    },
    mostPopularRewards: [
      { token: 'TOKEN1', count: 600, percentage: 60 },
      { token: 'TOKEN2', count: 400, percentage: 40 },
    ],
    userEngagementMetrics: {
      dailyActiveUsers: 100,
      weeklyActiveUsers: 300,
      monthlyActiveUsers: 500,
      averageClaimsPerUser: 2.0,
    },
    dailyStats: [
      { date: '2024-01-01', boxesOpened: 50, feesCollected: 5000 },
    ],
    weeklyStats: [
      { week: '2024-W01', boxesOpened: 350, feesCollected: 35000 },
    ],
    monthlyStats: [
      { month: '2024-01', boxesOpened: 1000, feesCollected: 100000 },
    ],
  };

  it('should load and display statistics', async () => {
    vi.mocked(statisticsService.StatisticsService.getStatistics).mockResolvedValue(
      mockStatistics
    );

    render(<StatisticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument(); // totalBoxesOpened
    });
  });

  it('should display loading state initially', () => {
    vi.mocked(statisticsService.StatisticsService.getStatistics).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<StatisticsPage />);

    expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
  });

  it('should display error state on failure', async () => {
    vi.mocked(statisticsService.StatisticsService.getStatistics).mockRejectedValue(
      new Error('Network error')
    );

    render(<StatisticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading Statistics')).toBeInTheDocument();
    });
  });

  it('should auto-refresh statistics', async () => {
    const mockFn = vi.mocked(statisticsService.StatisticsService.getStatistics);
    mockFn.mockResolvedValue(mockStatistics);

    render(<StatisticsPage />);

    // Initial call
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    // Simulate time passing (60 seconds)
    vi.useFakeTimers();
    vi.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    vi.useRealTimers();
  });
});
```

## E2E Tests

### Cypress Tests

```typescript
// frontend/cypress/e2e/admin/statistics.cy.ts

describe('Admin Statistics Page', () => {
  beforeEach(() => {
    cy.login({ role: 'admin' });
    cy.visit('/admin/statistics');
  });

  it('should display statistics page with all sections', () => {
    cy.get('h1').contains('Statistics').should('be.visible');
    cy.get('[data-testid="stats-grid"]').should('be.visible');
    cy.get('[data-testid="daily-chart"]').should('be.visible');
    cy.get('[data-testid="weekly-chart"]').should('be.visible');
    cy.get('[data-testid="reward-distribution"]').should('be.visible');
    cy.get('[data-testid="popular-rewards"]').should('be.visible');
    cy.get('[data-testid="engagement-metrics"]').should('be.visible');
  });

  it('should load data from blockchain', () => {
    cy.get('[data-testid="total-boxes"]')
      .should('contain.text', /\d+/)
      .and('not.contain.text', 'Loading');
  });

  it('should handle access control', () => {
    cy.logout();
    cy.visit('/admin/statistics');
    cy.url().should('include', '/login');
  });

  it('should auto-refresh data', () => {
    cy.get('[data-testid="total-boxes"]').then(el => {
      const initialValue = el.text();

      // Wait 60 seconds
      cy.wait(60000);

      cy.get('[data-testid="total-boxes"]').should('not.be.empty');
    });
  });

  it('should display responsive layout on mobile', () => {
    cy.viewport('iphone-x');

    cy.get('[data-testid="stats-grid"]').should('be.visible');
    cy.get('[data-testid="daily-chart"]').should('be.visible');
    cy.get('[data-testid="engagement-metrics"]').should('be.visible');
  });
});
```

## Test Execution

### Running All Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm run test -- statistics.test.ts
```

### Coverage Goals

| Metric | Target |
|--------|--------|
| Statement Coverage | > 80% |
| Branch Coverage | > 75% |
| Function Coverage | > 80% |
| Line Coverage | > 80% |

## Mock Data for Testing

### Generate Mock Statistics

```typescript
// __tests__/mocks/statistics.ts

export const generateMockStatistics = (overrides = {}) => ({
  totalBoxesOpened: 1000,
  totalFeesCollected: 100000n,
  uniqueUsers: 500,
  rewardDistribution: {
    '0xtoken1': 600,
    '0xtoken2': 400,
  },
  mostPopularRewards: [
    { token: 'TOKEN1', count: 600, percentage: 60 },
    { token: 'TOKEN2', count: 400, percentage: 40 },
  ],
  userEngagementMetrics: {
    dailyActiveUsers: 100,
    weeklyActiveUsers: 300,
    monthlyActiveUsers: 500,
    averageClaimsPerUser: 2.0,
  },
  dailyStats: generateDailyStats(),
  weeklyStats: generateWeeklyStats(),
  monthlyStats: generateMonthlyStats(),
  ...overrides,
});
```

## Testing Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Coverage meets targets
- [ ] No console errors or warnings
- [ ] Performance benchmarks met (< 2s load time)
- [ ] Responsive design verified on mobile/tablet
- [ ] Error states properly tested
- [ ] Loading states properly tested
- [ ] Access control verified

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test-issue-91.yml
name: Test Issue #91

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
```

## Related Documentation

- **ISSUE_91_API_DOCUMENTATION.md**: API reference
- **ISSUE_91_IMPLEMENTATION_GUIDE.md**: Architecture
- **ISSUE_91_PERFORMANCE_GUIDE.md**: Performance optimization
