# Reward Visualization System Documentation

## Overview

The Reward Visualization System provides comprehensive analytics and visual representations of reward distribution and probability calculations for the Smet Gaming Ecosystem. This system includes smart contracts for data collection, frontend components for visualization, and utilities for probability calculations.

## Architecture

### Smart Contracts

#### RewardAnalytics Contract
The core analytics contract that collects and processes reward data.

**Key Features:**
- Records reward opening and claiming events
- Tracks statistics per contract
- Calculates probability distributions
- Provides data aggregation functions

**Main Functions:**
```solidity
function recordRewardOpened(address user, uint256 rewardIndex) external
function recordRewardClaimed(uint256 value) external
function getRewardDistribution(address contract_, uint256 maxRewards) external view returns (uint256[])
function getContractStats(address contract_) external view returns (uint256, uint256, uint256)
function calculateProbabilities(uint32[] weights) external pure returns (ProbabilityData[])
```

### Frontend Components

#### RewardDashboard
Comprehensive dashboard combining all visualization components.

**Features:**
- Real-time statistics display
- Interactive charts and graphs
- Mobile-responsive design
- Data refresh functionality

#### Visualization Components

1. **RewardPieChart**: Displays reward distribution as a pie chart
2. **ProbabilityBarChart**: Shows reward probabilities as a bar chart
3. **RewardStats**: Displays key metrics and statistics

### Services

#### RewardVisualizationService
TypeScript service for blockchain interaction and data processing.

**Capabilities:**
- Fetches reward distribution data
- Calculates probability metrics
- Formats data for visualization
- Handles contract interactions

## Visualization Types

### 1. Reward Distribution Pie Chart

**Purpose**: Shows the actual distribution of claimed rewards
**Data Source**: On-chain reward claiming events
**Features**:
- Color-coded by reward type
- Interactive tooltips
- Percentage and count display
- Mobile-responsive legend

**Implementation**:
```tsx
<RewardPieChart 
  data={distributionData} 
  title="Reward Distribution"
  height={350}
/>
```

### 2. Probability Bar Chart

**Purpose**: Visualizes the theoretical probability of each reward
**Data Source**: Contract weight configurations
**Features**:
- Color-coded by rarity
- Probability percentages
- Weight information
- Rarity classification

**Implementation**:
```tsx
<ProbabilityBarChart 
  data={probabilityData} 
  title="Reward Probabilities"
  height={350}
/>
```

### 3. Statistics Dashboard

**Purpose**: Displays key performance metrics
**Metrics Included**:
- Total rewards opened
- Total rewards claimed
- Claim success rate
- Total value distributed
- Entry fee information

**Features**:
- Real-time updates
- Mobile-responsive cards
- Icon-based visual indicators
- Formatted number display

## Probability Calculations

### Weight-Based System

The system uses a cumulative distribution function (CDF) based on weights:

```typescript
// Calculate probability from weights
const totalWeight = weights.reduce((sum, w) => sum + w, 0);
const probability = (weight / totalWeight) * 100;
```

### Rarity Classification

Rewards are classified into rarity tiers based on probability:

- **Common**: ≥40% probability (Green)
- **Rare**: 20-39% probability (Blue)
- **Epic**: 10-19% probability (Purple)
- **Legendary**: <10% probability (Orange)

### Expected Value Calculations

```typescript
const expectedValue = (probability / 100) * rewardValue;
const houseEdge = ((entryFee - totalExpectedValue) / entryFee) * 100;
```

## Mobile Responsiveness

### Responsive Design Features

1. **Adaptive Layouts**:
   - Single column on mobile
   - Multi-column on desktop
   - Flexible chart sizing

2. **Touch-Friendly Interactions**:
   - Large touch targets
   - Swipe gestures for charts
   - Mobile-optimized tooltips

3. **Performance Optimizations**:
   - Lazy loading of charts
   - Responsive chart rendering
   - Optimized data fetching

### Breakpoint Strategy

```css
/* Mobile First Approach */
.chart-container {
  @apply w-full h-64 sm:h-80 lg:h-96;
}

.stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}
```

## Data Flow

### 1. Data Collection
```
Smart Contracts → RewardAnalytics → Event Emission
```

### 2. Data Processing
```
Blockchain Events → Service Layer → Data Transformation
```

### 3. Visualization
```
Processed Data → React Components → Interactive Charts
```

## API Reference

### RewardVisualizationService

#### Initialization
```typescript
await rewardVisualizationService.initialize(
  provider, 
  analyticsAddress, 
  rewardAddress
);
```

#### Data Fetching
```typescript
// Get reward distribution
const distribution = await service.getRewardDistribution(maxRewards);

// Get probability data
const probabilities = await service.getProbabilityData();

// Get contract statistics
const stats = await service.getContractStats();
```

### ProbabilityCalculator Utility

#### Basic Calculations
```typescript
// Calculate probabilities from weights
const results = ProbabilityCalculator.calculateProbabilities(weights);

// Simulate reward outcomes
const simulation = ProbabilityCalculator.simulateRewards(weights, 10000);

// Calculate house edge
const edge = ProbabilityCalculator.calculateHouseEdge(weights, entryFee);
```

#### Strategy Analysis
```typescript
const strategy = ProbabilityCalculator.getOptimalStrategy(
  weights, 
  budget, 
  entryFee
);
```

## Usage Examples

### Basic Dashboard Implementation

```tsx
import { RewardDashboard } from '@/components/visualizations/RewardDashboard';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <RewardDashboard 
        analyticsAddress="0x..."
        rewardAddress="0x..."
      />
    </div>
  );
}
```

### Custom Visualization

```tsx
import { useState, useEffect } from 'react';
import { rewardVisualizationService } from '@/services/rewardVisualization';
import { RewardPieChart } from '@/components/visualizations/RewardPieChart';

function CustomAnalytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const distribution = await rewardVisualizationService.getRewardDistribution();
      setData(distribution);
    };
    loadData();
  }, []);

  return <RewardPieChart data={data} title="Custom Distribution" />;
}
```

## Deployment

### Smart Contract Deployment

```bash
# Deploy analytics contract
npx hardhat run contract/scripts/deploy-reward-analytics.ts --network <network>
```

### Frontend Configuration

```bash
# Environment variables
NEXT_PUBLIC_ANALYTICS_ADDRESS=0x...
NEXT_PUBLIC_REWARD_ADDRESS=0x...
```

### Integration Steps

1. Deploy RewardAnalytics contract
2. Authorize reward contracts to record data
3. Configure frontend with contract addresses
4. Initialize visualization service
5. Deploy analytics dashboard

## Testing

### Smart Contract Tests

```bash
# Run analytics tests
npx hardhat test contract/test/RewardAnalytics.test.ts
```

### Test Coverage

- Contract authorization
- Data recording functionality
- Probability calculations
- Statistics aggregation
- Multi-contract support

### Frontend Testing

```typescript
// Mock data for testing
const mockDistribution = [
  { rewardId: 0, name: 'Common Sword', count: 450, percentage: 45, color: '#10B981' },
  { rewardId: 1, name: 'Rare Shield', count: 250, percentage: 25, color: '#3B82F6' }
];

// Test component rendering
render(<RewardPieChart data={mockDistribution} />);
```

## Performance Considerations

### On-Chain Optimization

- **Gas Efficiency**: Minimal storage operations
- **Event Indexing**: Optimized event structure
- **Batch Operations**: Efficient data aggregation

### Frontend Optimization

- **Chart Performance**: Optimized rendering with recharts
- **Data Caching**: Service-level caching
- **Lazy Loading**: Components loaded on demand
- **Responsive Images**: Optimized chart rendering

## Security Considerations

### Smart Contract Security

- **Access Control**: Only authorized contracts can record data
- **Data Integrity**: Immutable event logs
- **Owner Functions**: Protected administrative functions

### Frontend Security

- **Input Validation**: Sanitized user inputs
- **Contract Verification**: Address validation
- **Error Handling**: Graceful error management

## Monitoring and Analytics

### Real-time Monitoring

- Contract event monitoring
- Data accuracy verification
- Performance metrics tracking

### Analytics Metrics

- Chart interaction rates
- Data refresh frequency
- User engagement patterns
- Mobile vs desktop usage

## Future Enhancements

### Planned Features

1. **Advanced Filtering**: Date ranges, reward types, user segments
2. **Export Functionality**: CSV/PDF export of charts and data
3. **Real-time Updates**: WebSocket-based live data
4. **Comparative Analysis**: Multi-contract comparisons
5. **Predictive Analytics**: Trend analysis and forecasting

### Technical Improvements

1. **Performance**: Chart virtualization for large datasets
2. **Accessibility**: Screen reader support and keyboard navigation
3. **Internationalization**: Multi-language support
4. **Offline Support**: Cached data for offline viewing

## Best Practices

### Development Guidelines

1. **Mobile-First**: Design for mobile, enhance for desktop
2. **Performance**: Optimize chart rendering and data loading
3. **Accessibility**: Ensure charts are accessible to all users
4. **Testing**: Comprehensive testing of calculations and visualizations

### User Experience

1. **Loading States**: Clear loading indicators
2. **Error Handling**: Informative error messages
3. **Responsive Design**: Consistent experience across devices
4. **Interactive Elements**: Intuitive chart interactions