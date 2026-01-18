# Issue #91 - Data Structures Documentation

## Overview

This document provides detailed documentation for all data structures used in the admin statistics page, including TypeScript interfaces, contract events, and database schemas.

## TypeScript Interfaces

### BoxOpenedEvent

Represents a reward box opening event emitted by the contract.

```typescript
interface BoxOpenedEvent {
  /**
   * User address who opened the reward box
   * @type {string}
   * @example "0x742d35Cc6634C0532925a3b844Bc029e4c98b5fb"
   */
  opener: string;

  /**
   * VRF (Verifiable Random Function) request ID
   * Used to track the randomness request
   * @type {string}
   * @example "1"
   */
  requestId: string;

  /**
   * Block number where event was emitted
   * @type {number}
   * @example 123456
   */
  blockNumber: number;

  /**
   * Unix timestamp of the block
   * Seconds since epoch
   * @type {number}
   * @example 1700000000
   */
  timestamp: number;
}
```

**Usage Example:**
```typescript
const event: BoxOpenedEvent = {
  opener: '0x742d35Cc6634C0532925a3b844Bc029e4c98b5fb',
  requestId: '12345',
  blockNumber: 150000,
  timestamp: 1700000000,
};
```

---

### RewardOutEvent

Represents a reward distribution event emitted when a user receives a reward.

```typescript
interface RewardOutEvent {
  /**
   * User address receiving the reward
   * @type {string}
   */
  opener: string;

  /**
   * Type of reward asset
   * 0 = Native token (e.g., ETH)
   * 1 = ERC20 token
   * 2 = ERC721 NFT
   * 3 = ERC1155 multi-token
   * @type {number}
   */
  tokenType: number;

  /**
   * Contract address of the token
   * For native tokens: zero address
   * @type {string}
   * @example "0x1234567890123456789012345678901234567890"
   */
  tokenAddress: string;

  /**
   * Amount (for fungible tokens) or Token ID (for NFTs)
   * @type {number}
   */
  amount: number;

  /**
   * Block number where event was emitted
   * @type {number}
   */
  blockNumber: number;

  /**
   * Unix timestamp of the block
   * @type {number}
   */
  timestamp: number;
}
```

**Reward Type Mapping:**
```typescript
const REWARD_TYPES = {
  0: 'Native',
  1: 'ERC20',
  2: 'ERC721',
  3: 'ERC1155',
};
```

**Usage Example:**
```typescript
const reward: RewardOutEvent = {
  opener: '0x742d35Cc6634C0532925a3b844Bc029e4c98b5fb',
  tokenType: 1, // ERC20
  tokenAddress: '0xERC20ContractAddress',
  amount: 1000,
  blockNumber: 150100,
  timestamp: 1700000100,
};
```

---

### StatisticsData

Main data structure containing aggregated statistics.

```typescript
interface StatisticsData {
  /**
   * Total number of reward boxes opened
   * @type {number}
   * @example 5000
   */
  totalBoxesOpened: number;

  /**
   * Total fees collected from all box openings
   * Stored in wei (1 ETH = 10^18 wei)
   * @type {bigint}
   * @example 50000000000000000000n (50 ETH)
   */
  totalFeesCollected: bigint;

  /**
   * Number of unique user addresses
   * @type {number}
   * @example 2500
   */
  uniqueUsers: number;

  /**
   * Distribution of rewards by token address
   * Maps token address to count of distributions
   * @type {Record<string, number>}
   * @example {
   *   "0xToken1": 3000,
   *   "0xToken2": 2000
   * }
   */
  rewardDistribution: Record<string, number>;

  /**
   * Top 5 most claimed rewards with statistics
   * @type {Array<{token: string, count: number, percentage: number}>}
   */
  mostPopularRewards: Array<{
    /**
     * Token address or identifier
     * @type {string}
     */
    token: string;

    /**
     * Number of times this reward was claimed
     * @type {number}
     */
    count: number;

    /**
     * Percentage of total rewards
     * Range: 0-100
     * @type {number}
     * @example 35.5
     */
    percentage: number;
  }>;

  /**
   * User engagement metrics
   * @type {Object}
   */
  userEngagementMetrics: {
    /**
     * Unique users active in last 24 hours
     * @type {number}
     */
    dailyActiveUsers: number;

    /**
     * Unique users active in last 7 days
     * @type {number}
     */
    weeklyActiveUsers: number;

    /**
     * Unique users active in last 30 days
     * @type {number}
     */
    monthlyActiveUsers: number;

    /**
     * Average number of claims per unique user
     * Calculated as: totalClaims / uniqueUsers
     * @type {number}
     * @example 2.0
     */
    averageClaimsPerUser: number;
  };

  /**
   * Daily statistics (last 30 days)
   * @type {Array<{date: string, boxesOpened: number, feesCollected: number}>}
   */
  dailyStats: Array<{
    /**
     * Date in YYYY-MM-DD format
     * @type {string}
     * @example "2024-01-15"
     */
    date: string;

    /**
     * Number of boxes opened on this day
     * @type {number}
     */
    boxesOpened: number;

    /**
     * Total fees collected on this day
     * @type {number}
     */
    feesCollected: number;
  }>;

  /**
   * Weekly statistics (last 12 weeks)
   * @type {Array<{week: string, boxesOpened: number, feesCollected: number}>}
   */
  weeklyStats: Array<{
    /**
     * Week identifier
     * @type {string}
     * @example "2024-W02"
     */
    week: string;

    /**
     * Number of boxes opened in this week
     * @type {number}
     */
    boxesOpened: number;

    /**
     * Total fees collected in this week
     * @type {number}
     */
    feesCollected: number;
  }>;

  /**
   * Monthly statistics (last 12 months)
   * @type {Array<{month: string, boxesOpened: number, feesCollected: number}>}
   */
  monthlyStats: Array<{
    /**
     * Month in YYYY-MM format
     * @type {string}
     * @example "2024-01"
     */
    month: string;

    /**
     * Number of boxes opened in this month
     * @type {number}
     */
    boxesOpened: number;

    /**
     * Total fees collected in this month
     * @type {number}
     */
    feesCollected: number;
  }>;
}
```

**Usage Example:**
```typescript
const stats: StatisticsData = {
  totalBoxesOpened: 5000,
  totalFeesCollected: BigInt("50000000000000000000"), // 50 ETH
  uniqueUsers: 2500,
  rewardDistribution: {
    "0xToken1": 3000,
    "0xToken2": 2000,
  },
  mostPopularRewards: [
    { token: "0xToken1", count: 3000, percentage: 60 },
    { token: "0xToken2", count: 2000, percentage: 40 },
  ],
  userEngagementMetrics: {
    dailyActiveUsers: 150,
    weeklyActiveUsers: 600,
    monthlyActiveUsers: 2000,
    averageClaimsPerUser: 2.0,
  },
  dailyStats: [
    { date: "2024-01-15", boxesOpened: 200, feesCollected: 20000 },
  ],
  weeklyStats: [
    { week: "2024-W02", boxesOpened: 1400, feesCollected: 140000 },
  ],
  monthlyStats: [
    { month: "2024-01", boxesOpened: 5000, feesCollected: 500000 },
  ],
};
```

---

## Contract Events

### Opened Event

**Emitted by**: SmetReward contract
**When**: User opens a reward box

```solidity
event Opened(
  address indexed opener,
  uint256 indexed requestId
);
```

**Indexed Parameters**:
- `opener`: User address (indexed for filtering)
- `requestId`: VRF request ID (indexed for tracking)

**Parsing:**
```typescript
parseAbiItem('event Opened(address indexed opener, uint256 indexed reqId)')
```

---

### RewardOut Event

**Emitted by**: SmetReward contract
**When**: Reward is distributed to user

```solidity
event RewardOut(
  address indexed opener,
  Reward reward
);

struct Reward {
  uint8 assetType;     // 0=native, 1=ERC20, 2=ERC721, 3=ERC1155
  address token;       // Token contract address
  uint256 idOrAmount;  // Amount for fungibles, ID for NFTs
}
```

**Indexed Parameters**:
- `opener`: User receiving reward (indexed)

**Parsing:**
```typescript
parseAbiItem(
  'event RewardOut(address indexed opener, tuple(uint8 assetType, address token, uint256 idOrAmount) reward)'
)
```

---

## Component Props

### StatsCard Props

```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
```

---

### TimeSeriesChart Props

```typescript
interface TimeSeriesChartProps {
  title: string;
  data: Array<{
    label: string;
    value: number;
  }>;
  type?: 'bar' | 'line';
  color?: string;
}
```

---

### UserEngagementMetrics Props

```typescript
interface UserEngagementMetricsProps {
  data: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageClaimsPerUser: number;
  };
}
```

---

## Database Schema (For Caching)

If implementing backend caching with PostgreSQL:

```sql
-- Statistics cache table
CREATE TABLE statistics_cache (
  id BIGSERIAL PRIMARY KEY,
  block_number BIGINT NOT NULL,
  total_boxes_opened INTEGER NOT NULL,
  total_fees_collected DECIMAL(50, 0) NOT NULL,
  unique_users INTEGER NOT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  data_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_hash UNIQUE (data_hash),
  CONSTRAINT positive_boxes CHECK (total_boxes_opened >= 0),
  CONSTRAINT positive_fees CHECK (total_fees_collected >= 0),
  CONSTRAINT positive_users CHECK (unique_users >= 0)
);

-- Indexes for fast queries
CREATE INDEX idx_statistics_block_number ON statistics_cache(block_number DESC);
CREATE INDEX idx_statistics_updated_at ON statistics_cache(last_updated DESC);
CREATE INDEX idx_statistics_hash ON statistics_cache(data_hash);

-- Daily statistics
CREATE TABLE daily_statistics (
  id BIGSERIAL PRIMARY KEY,
  stat_date DATE NOT NULL UNIQUE,
  boxes_opened INTEGER NOT NULL,
  fees_collected DECIMAL(50, 0) NOT NULL,
  unique_users INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT positive_boxes CHECK (boxes_opened >= 0),
  CONSTRAINT positive_fees CHECK (fees_collected >= 0),
  CONSTRAINT positive_users CHECK (unique_users >= 0)
);

-- Weekly statistics
CREATE TABLE weekly_statistics (
  id BIGSERIAL PRIMARY KEY,
  week_year VARCHAR(7) NOT NULL UNIQUE, -- YYYY-Www format
  boxes_opened INTEGER NOT NULL,
  fees_collected DECIMAL(50, 0) NOT NULL,
  unique_users INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reward distribution
CREATE TABLE reward_distribution (
  id BIGSERIAL PRIMARY KEY,
  token_address VARCHAR(42) NOT NULL,
  distribution_count INTEGER NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT positive_count CHECK (distribution_count >= 0),
  CONSTRAINT valid_percentage CHECK (percentage BETWEEN 0 AND 100)
);

CREATE INDEX idx_reward_distribution_token ON reward_distribution(token_address);
```

---

## Serialization Formats

### JSON Format

```json
{
  "totalBoxesOpened": 5000,
  "totalFeesCollected": "50000000000000000000",
  "uniqueUsers": 2500,
  "rewardDistribution": {
    "0xToken1": 3000,
    "0xToken2": 2000
  },
  "mostPopularRewards": [
    {
      "token": "0xToken1",
      "count": 3000,
      "percentage": 60
    }
  ],
  "userEngagementMetrics": {
    "dailyActiveUsers": 150,
    "weeklyActiveUsers": 600,
    "monthlyActiveUsers": 2000,
    "averageClaimsPerUser": 2.0
  },
  "dailyStats": [],
  "weeklyStats": [],
  "monthlyStats": []
}
```

### BigInt Handling

```typescript
// Serialize BigInt to string for JSON
const serialized = JSON.stringify(stats, (key, value) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
});

// Deserialize string back to BigInt
const deserialized = JSON.parse(serialized, (key, value) => {
  if (key === 'totalFeesCollected' && typeof value === 'string') {
    return BigInt(value);
  }
  return value;
});
```

---

## Enum-like Constants

```typescript
// Reward types
export const REWARD_TYPES = {
  NATIVE: 0,
  ERC20: 1,
  ERC721: 2,
  ERC1155: 3,
} as const;

// Time windows for engagement
export const TIME_WINDOWS = {
  DAILY: 86400,      // 24 hours in seconds
  WEEKLY: 604800,    // 7 days in seconds
  MONTHLY: 2592000,  // 30 days in seconds
} as const;

// Chart types
export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
} as const;
```

---

## Type Guard Functions

```typescript
// Check if object is valid StatisticsData
function isValidStatisticsData(obj: unknown): obj is StatisticsData {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const data = obj as Record<string, unknown>;
  
  return (
    typeof data.totalBoxesOpened === 'number' &&
    typeof data.totalFeesCollected === 'bigint' &&
    typeof data.uniqueUsers === 'number' &&
    typeof data.rewardDistribution === 'object' &&
    Array.isArray(data.mostPopularRewards) &&
    typeof data.userEngagementMetrics === 'object'
  );
}

// Usage
if (isValidStatisticsData(data)) {
  // Safe to use data as StatisticsData
}
```

---

## Type Conversion Examples

```typescript
// Convert fees from wei to ETH
const feesInEth = formatEther(stats.totalFeesCollected);

// Convert timestamp to readable date
const date = new Date(stats.dailyStats[0].date);
const readable = date.toLocaleDateString('en-US');

// Convert percentage to display format
const percentage = (reward.percentage).toFixed(2) + '%';

// Convert count to formatted number
const formatted = new Intl.NumberFormat('en-US').format(stats.totalBoxesOpened);
```

---

## Related Documentation

- **ISSUE_91_API_DOCUMENTATION.md**: API reference
- **ISSUE_91_IMPLEMENTATION_GUIDE.md**: Implementation details
