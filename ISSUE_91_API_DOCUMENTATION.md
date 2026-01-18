# Issue #91 - Admin Statistics Page API Documentation

## Overview

The Admin Statistics Page integrates with the Smet Reward System to provide comprehensive on-chain analytics and metrics. This documentation describes all services, components, and data structures used in the statistics feature.

## Statistics Service API

### `StatisticsService` Class

Core service for fetching and aggregating on-chain statistics from the reward contract.

#### Methods

##### `getOpenedEvents(fromBlock: bigint = 0n): Promise<BoxOpenedEvent[]>`

Fetches all reward box opened events from the blockchain.

**Parameters:**
- `fromBlock`: Starting block number for event fetch (default: 0)

**Returns:** Array of box opened events with timestamps

**Example:**
```typescript
const events = await StatisticsService.getOpenedEvents();
// Returns events with structure: { opener, requestId, blockNumber, timestamp }
```

---

##### `getRewardOutEvents(fromBlock: bigint = 0n): Promise<RewardOutEvent[]>`

Fetches all reward distribution events from the blockchain.

**Parameters:**
- `fromBlock`: Starting block number for event fetch (default: 0)

**Returns:** Array of reward distribution events with timestamps

**Example:**
```typescript
const rewards = await StatisticsService.getRewardOutEvents();
// Returns reward events with: { opener, tokenType, tokenAddress, amount, blockNumber, timestamp }
```

---

##### `getTotalFeesCollected(): Promise<bigint>`

Calculates total fees collected from all box opening transactions.

**Returns:** Total fees in wei (bigint)

**Example:**
```typescript
const fees = await StatisticsService.getTotalFeesCollected();
const formattedFees = formatEther(fees); // Convert to readable format
```

---

##### `getStatistics(): Promise<StatisticsData>`

Main method that aggregates all statistics and returns comprehensive data structure.

**Returns:** Complete statistics data object

**Data Structure:**
```typescript
{
  totalBoxesOpened: number;
  totalFeesCollected: bigint;
  uniqueUsers: number;
  rewardDistribution: Record<string, number>;
  mostPopularRewards: Array<{ token: string; count: number; percentage: number }>;
  userEngagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageClaimsPerUser: number;
  };
  dailyStats: Array<{ date: string; boxesOpened: number; feesCollected: number }>;
  weeklyStats: Array<{ week: string; boxesOpened: number; feesCollected: number }>;
  monthlyStats: Array<{ month: string; boxesOpened: number; feesCollected: number }>;
}
```

**Example:**
```typescript
const stats = await StatisticsService.getStatistics();
console.log(`Total boxes opened: ${stats.totalBoxesOpened}`);
console.log(`Unique users: ${stats.uniqueUsers}`);
```

---

## Data Interfaces

### `BoxOpenedEvent`

Represents a single box opening event from the blockchain.

```typescript
interface BoxOpenedEvent {
  opener: string;              // User address who opened the box
  requestId: string;           // VRF request ID
  blockNumber: number;         // Block where event occurred
  timestamp: number;           // Unix timestamp of event
}
```

---

### `RewardOutEvent`

Represents a reward distribution event.

```typescript
interface RewardOutEvent {
  opener: string;              // User address receiving reward
  tokenType: number;           // Type of reward (0=native, 1=ERC20, 2=ERC721, 3=ERC1155)
  tokenAddress: string;        // Address of token contract
  amount: number;              // Amount or token ID
  blockNumber: number;         // Block where event occurred
  timestamp: number;           // Unix timestamp of event
}
```

---

### `StatisticsData`

Complete statistics response object containing all aggregated data.

```typescript
interface StatisticsData {
  totalBoxesOpened: number;        // Total number of boxes opened
  totalFeesCollected: bigint;      // Total fees in wei
  uniqueUsers: number;             // Count of unique users
  rewardDistribution: Record<string, number>;  // Count by token address
  mostPopularRewards: Array<{
    token: string;                 // Token identifier
    count: number;                 // Number of claims
    percentage: number;            // Percentage of total
  }>;
  userEngagementMetrics: {
    dailyActiveUsers: number;      // Active users in last 24h
    weeklyActiveUsers: number;     // Active users in last 7d
    monthlyActiveUsers: number;    // Active users in last 30d
    averageClaimsPerUser: number;  // Mean claims per unique user
  };
  dailyStats: Array<{
    date: string;                  // YYYY-MM-DD format
    boxesOpened: number;           // Boxes opened on this day
    feesCollected: number;         // Fees collected on this day
  }>;
  weeklyStats: Array<{
    week: string;                  // Week identifier
    boxesOpened: number;           // Boxes opened in this week
    feesCollected: number;         // Fees collected in this week
  }>;
  monthlyStats: Array<{
    month: string;                 // YYYY-MM format
    boxesOpened: number;           // Boxes opened in this month
    feesCollected: number;         // Fees collected in this month
  }>;
}
```

---

## Component API

### `StatsCard` Component

Displays a single statistic with title, value, and optional trend indicator.

**Props:**
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
```

**Usage:**
```typescript
<StatsCard
  title="Total Boxes Opened"
  value={statistics.totalBoxesOpened}
  icon={Package}
  trend="up"
  trendValue="+12% from last week"
/>
```

---

### `TimeSeriesChart` Component

Displays time-series data as bar or line charts.

**Props:**
```typescript
interface TimeSeriesChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  type?: 'bar' | 'line';
  color?: string;
}
```

**Usage:**
```typescript
<TimeSeriesChart
  title="Daily Box Openings"
  data={statistics.dailyStats.map(d => ({
    label: d.date,
    value: d.boxesOpened
  }))}
  type="bar"
  color="bg-blue-600"
/>
```

---

### `RewardDistributionChart` Component

Displays reward distribution as a pie chart.

**Props:**
```typescript
interface RewardDistributionChartProps {
  data: StatisticsData['rewardDistribution'];
}
```

**Usage:**
```typescript
<RewardDistributionChart data={statistics.rewardDistribution} />
```

---

### `MostPopularRewardsCard` Component

Displays top 5 most claimed rewards with percentages.

**Props:**
```typescript
interface MostPopularRewardsCardProps {
  rewards: StatisticsData['mostPopularRewards'];
}
```

**Usage:**
```typescript
<MostPopularRewardsCard rewards={statistics.mostPopularRewards} />
```

---

### `UserEngagementMetrics` Component

Displays four key user engagement metrics in a grid.

**Props:**
```typescript
interface UserEngagementMetricsProps {
  data: StatisticsData['userEngagementMetrics'];
}
```

**Usage:**
```typescript
<UserEngagementMetrics data={statistics.userEngagementMetrics} />
```

---

## Constants

### Contract Configuration

All contract addresses and configurations are defined in `frontend/src/config/contracts.ts`:

```typescript
export const REWARD_CONTRACT_ADDRESS = '0x...'; // Smet Reward contract address
```

---

## Network Configuration

The service uses Lisk Sepolia testnet by default:

```typescript
const publicClient = createPublicClient({
  chain: liskSepolia,
  transport: http(),
});
```

To use a different network, modify the chain configuration in `statistics.ts`.

---

## Error Handling

All service methods include try-catch blocks and return empty arrays/default values on error.

**Example:**
```typescript
try {
  const stats = await StatisticsService.getStatistics();
} catch (error) {
  console.error('Error loading statistics:', error);
  // Component will display error state
}
```

---

## Performance Considerations

- **Event Fetching**: Fetches from block 0 by default. Consider implementing block range caching for production.
- **Timestamp Resolution**: Timestamps are block-based. Network finality affects accuracy.
- **Fee Calculation**: Iterates through all opened events. May need pagination for very large datasets.

---

## Blockchain Events

The service monitors two main contract events:

### `Opened(address indexed opener, uint256 indexed reqId)`

Emitted when a reward box is opened.

---

### `RewardOut(address indexed opener, tuple(uint8 assetType, address token, uint256 idOrAmount) reward)`

Emitted when a reward is distributed.

---

## Integration Example

```typescript
// In your component
const [statistics, setStatistics] = useState<StatisticsData | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadStats = async () => {
    const data = await StatisticsService.getStatistics();
    setStatistics(data);
    setLoading(false);
  };
  
  loadStats();
  
  // Auto-refresh every 60 seconds
  const interval = setInterval(loadStats, 60000);
  return () => clearInterval(interval);
}, []);
```

---

## Extending the Service

To add new statistics:

1. Add new event type in the service
2. Create calculation method in `StatisticsService`
3. Add result to `StatisticsData` interface
4. Create component to display the data
5. Integrate component in the statistics page

---

## Troubleshooting

See `ISSUE_91_TROUBLESHOOTING_GUIDE.md` for common issues and solutions.
