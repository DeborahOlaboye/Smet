# Issue #91 - Implementation Guide: Admin Statistics Page

## Overview

This document provides a detailed walkthrough of the admin statistics page implementation, explaining the architecture, design decisions, and how each component fits together.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   └── admin/
│   │       ├── statistics/
│   │       │   └── page.tsx          # Main statistics page
│   │       └── ...
│   ├── services/
│   │   └── statistics.ts              # Data fetching service
│   ├── components/
│   │   ├── admin/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── TimeSeriesChart.tsx
│   │   │   ├── RewardDistributionChart.tsx
│   │   │   ├── MostPopularRewardsCard.tsx
│   │   │   ├── UserEngagementMetrics.tsx
│   │   │   └── ProtectedRoute.tsx      # Existing auth component
│   │   ├── ui/
│   │   │   ├── Card.tsx               # Updated with exports
│   │   │   └── Toast.tsx
│   │   └── ...
│   └── config/
│       └── contracts.ts                # Contract addresses
└── ...
```

## Architecture

### 1. Data Layer (StatisticsService)

The `StatisticsService` handles all blockchain interaction:

```
┌─────────────────────────────────┐
│   Blockchain Events             │
├─────────────────────────────────┤
│ - Opened events                 │
│ - RewardOut events              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  StatisticsService              │
├─────────────────────────────────┤
│ - getOpenedEvents()             │
│ - getRewardOutEvents()          │
│ - getTotalFeesCollected()       │
│ - getStatistics()               │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  StatisticsData                 │
├─────────────────────────────────┤
│ - totalBoxesOpened              │
│ - totalFeesCollected            │
│ - userEngagementMetrics         │
│ - dailyStats, weeklyStats, etc. │
└─────────────────────────────────┘
```

**Key Features:**
- Uses viem's `publicClient` for blockchain queries
- Fetches events using ABI parsing
- Includes block timestamps for time-series analysis
- Error handling with fallback empty arrays

### 2. Presentation Layer (React Components)

The presentation layer is structured as composable, reusable components:

#### StatsCard Component
- **Purpose**: Display individual metrics
- **Props**: title, value, icon, trend
- **Usage**: Shown in the "Key Metrics" grid
- **File**: `components/admin/StatsCard.tsx`

#### TimeSeriesChart Component
- **Purpose**: Visualize time-based data
- **Props**: title, data array, chart type (bar/line)
- **Usage**: Daily, weekly, and monthly statistics
- **File**: `components/admin/TimeSeriesChart.tsx`

#### RewardDistributionChart Component
- **Purpose**: Show reward token distribution
- **Props**: reward distribution data
- **Usage**: Pie chart in "Reward Distribution" section
- **File**: `components/admin/RewardDistributionChart.tsx`

#### MostPopularRewardsCard Component
- **Purpose**: Display top 5 most claimed rewards
- **Props**: array of reward objects
- **Usage**: Ranked list with percentages
- **File**: `components/admin/MostPopularRewardsCard.tsx`

#### UserEngagementMetrics Component
- **Purpose**: Show engagement KPIs
- **Props**: daily/weekly/monthly active users, avg claims
- **Usage**: 4-column grid layout
- **File**: `components/admin/UserEngagementMetrics.tsx`

### 3. Page Integration (statistics/page.tsx)

The main page orchestrates all components:

```typescript
┌─────────────────────────────────────┐
│   Admin Statistics Page             │
├─────────────────────────────────────┤
│ 1. Protected Route Wrapper          │
│ 2. Loading State UI                 │
│ 3. Error Handling UI                │
│ 4. Success State Layout:            │
│    - Header Section                 │
│    - Key Metrics (StatsCard grid)   │
│    - Daily/Weekly/Monthly Charts    │
│    - Reward Distribution            │
│    - Most Popular Rewards           │
│    - User Engagement Metrics        │
│    - Statistics Summary             │
└─────────────────────────────────────┘
```

## Implementation Details

### 1. State Management

```typescript
const [statistics, setStatistics] = useState<StatisticsData | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**State Transitions:**
- Initial: `loading = true`
- On Error: `loading = false, error = message`
- On Success: `loading = false, error = null, statistics = data`

### 2. Data Fetching Pattern

```typescript
useEffect(() => {
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await StatisticsService.getStatistics();
      setStatistics(stats);
    } catch (err) {
      setError('Failed to load statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  fetchStatistics();

  // Auto-refresh every 60 seconds
  const interval = setInterval(fetchStatistics, 60000);
  return () => clearInterval(interval);
}, []);
```

**Features:**
- Automatic error clearing on retry
- Auto-refresh interval (60 seconds)
- Cleanup of interval on unmount
- Loading states for all conditions

### 3. Component Layout

The page uses a responsive grid layout:

```typescript
<div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:ml-64">
  {/* Header */}
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold">Statistics</h1>
    <p className="text-sm sm:text-base text-gray-600 mt-1">...</p>
  </div>

  {/* Key Metrics Grid */}
  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    <StatsCard />
    <StatsCard />
    ...
  </div>

  {/* Charts Grid */}
  <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
    <TimeSeriesChart />
    <TimeSeriesChart />
  </div>

  {/* Other Sections */}
  ...
</div>
```

**Responsive Breakpoints:**
- `sm`: 640px (tablets)
- `md`: 768px (small desktops with sidebar)
- `lg`: 1024px (full width)

### 4. Data Processing

#### Calculating Unique Users
```typescript
const uniqueUsers = new Set(events.map(e => e.opener)).size;
```

#### Calculating Reward Distribution
```typescript
const distribution: Record<string, number> = {};
rewardEvents.forEach(event => {
  distribution[event.tokenAddress] = 
    (distribution[event.tokenAddress] || 0) + 1;
});
```

#### Time-Based Aggregation
```typescript
const groupByDate = (events: BoxOpenedEvent[]) => {
  const grouped: Record<string, number> = {};
  events.forEach(event => {
    const date = new Date(event.timestamp * 1000)
      .toISOString()
      .split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });
  return grouped;
};
```

#### Engagement Metrics
```typescript
const now = Date.now() / 1000;
const oneDayAgo = now - 86400;
const oneWeekAgo = now - 604800;
const oneMonthAgo = now - 2592000;

const dailyUsers = new Set(
  events
    .filter(e => e.timestamp > oneDayAgo)
    .map(e => e.opener)
).size;
```

## Integration Points

### With Existing Admin Sidebar

The statistics page integrates with the existing admin navigation:

1. **Route**: `/admin/statistics` (added to app structure)
2. **Navigation**: Link already exists in admin sidebar
3. **Access Control**: Uses existing `ProtectedRoute` component
4. **Styling**: Uses existing Tailwind configuration

### With Contract Configuration

Contract addresses are imported from central config:

```typescript
import { REWARD_CONTRACT_ADDRESS } from '@/config/contracts';
```

This ensures consistency across the application.

## Data Flow Example

```
User navigates to /admin/statistics
         │
         ▼
Page mounts, useEffect runs
         │
         ▼
StatisticsService.getStatistics() called
         │
         ├─ getOpenedEvents()
         │  └─ Fetches "Opened" events from contract
         │
         ├─ getRewardOutEvents()
         │  └─ Fetches "RewardOut" events from contract
         │
         └─ Aggregates data:
            ├─ Counts boxes and fees
            ├─ Calculates unique users
            ├─ Groups rewards by token
            ├─ Calculates engagement metrics
            └─ Builds time-series data
         │
         ▼
StatisticsData returned
         │
         ▼
setState(statistics)
         │
         ▼
Page re-renders with all components
         │
         ▼
Auto-refresh scheduled for 60 seconds later
```

## UI State Management

### Loading State
- Shows spinner with "Loading statistics..." message
- Uses existing `Loader2` icon from lucide-react
- Centered layout within page container

### Error State
- Shows error card with `AlertCircle` icon
- Displays error message from catch block
- User can refresh or navigate away

### Success State
- All data sections populated
- Charts rendered with data
- Components display metrics properly

## Performance Considerations

1. **Event Fetching**: Fetches from block 0 (consider caching)
2. **Timestamp Resolution**: Block-based, affected by network finality
3. **Auto-refresh**: 60-second interval balances freshness and network load
4. **Component Rendering**: All components are optimized with proper memoization patterns

## Testing Integration Points

1. **Service Layer**: Test event fetching and data aggregation
2. **Component Layer**: Test component rendering with mock data
3. **Page Layer**: Test state management and error handling
4. **Integration**: Test full flow from contract to UI

## Future Enhancements

1. **Caching**: Store block numbers to avoid re-fetching all events
2. **Filtering**: Add date range filters for stats
3. **Export**: Add CSV/JSON export functionality
4. **Alerts**: Set thresholds for anomaly detection
5. **Pagination**: Handle large datasets with pagination
6. **Real-time Updates**: Use WebSocket for live updates

## Deployment Checklist

- [ ] Review all components and service code
- [ ] Test on testnet with sample data
- [ ] Verify sidebar navigation link works
- [ ] Confirm ProtectedRoute component blocks unauthorized access
- [ ] Test loading and error states
- [ ] Verify auto-refresh functionality
- [ ] Check responsive design on mobile/tablet
- [ ] Confirm contract address is set correctly
- [ ] Test with different time ranges of data
