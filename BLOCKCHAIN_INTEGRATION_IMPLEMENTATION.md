# Smart Contract Integration Implementation

## Overview
Complete replacement of mock data with real smart contract integration for the Smet Gaming Ecosystem, connecting the frontend directly to deployed blockchain contracts.

## Features Implemented

### 1. Real Contract Integration
- **SmetReward Contract**: Direct integration with deployed reward contract
- **Real-time Data**: Live blockchain data instead of mock responses
- **Contract Calls**: Actual transaction execution on blockchain
- **Event Listening**: Real-time updates via blockchain events

### 2. Contract Configuration
- **Deployed Addresses**: All production contract addresses configured
- **ABI Definitions**: Complete contract ABIs for all interactions
- **Network Configuration**: Lisk Sepolia testnet integration
- **Type Safety**: Full TypeScript support for contract calls

### 3. Blockchain Services

#### Rewards Service (`rewards.ts`)
- **fetchRewards()**: Reads reward pool from SmetReward contract
- **openReward()**: Executes actual contract transactions
- **Real-time Stock**: Live inventory tracking from blockchain
- **Metadata Mapping**: Converts blockchain data to UI format

#### Event Service (`rewardEvents.ts`)
- **Event Listening**: Subscribes to contract events
- **Real-time Updates**: Automatic UI updates on blockchain changes
- **Transaction Tracking**: Monitors reward opening and distribution
- **User Filtering**: Personalized event notifications

### 4. Enhanced Hooks

#### useRewardContract
- **Contract Interaction**: Direct smart contract calls
- **Transaction Management**: Full transaction lifecycle handling
- **Error Handling**: Comprehensive blockchain error management
- **Loading States**: Real transaction progress tracking

#### useRealTimeRewards
- **Live Data**: Real-time reward pool updates
- **Event Integration**: Automatic refresh on blockchain events
- **User Notifications**: Toast notifications for reward events
- **State Management**: Efficient blockchain state synchronization

## Contract Integration Details

### SmetReward Contract Functions
```solidity
// Read Functions
function getAllRewards() external view returns (Reward[] memory)
function getRewardCount() external view returns (uint256)
function getReward(uint256 index) external view returns (Reward memory)
function getWeights() external view returns (uint32[] memory)
function fee() external view returns (uint256)
function getRewardStock(address token, uint256 tokenId) external view returns (uint256)

// Write Functions
function open(bool payInNative) external payable returns (uint256 reqId)
```

### Event Monitoring
```solidity
event Opened(address indexed opener, uint256 indexed reqId)
event RewardOut(address indexed opener, Reward reward)
```

## Data Flow

### 1. Reward Fetching
1. Read all rewards from contract via `getAllRewards()`
2. Fetch probability weights via `getWeights()`
3. Get current fee via `fee()`
4. Calculate probabilities and remaining stock
5. Map blockchain data to UI format

### 2. Reward Opening
1. User clicks open reward button
2. Check wallet connection and contract fee
3. Execute `open(true)` contract function with fee payment
4. Monitor transaction status and confirmation
5. Listen for `RewardOut` event for actual reward
6. Update UI with real-time blockchain data

### 3. Real-time Updates
1. Subscribe to contract events on component mount
2. Filter events by user address for personalization
3. Show notifications for reward processing and distribution
4. Automatically refresh reward pool data
5. Update inventory counts in real-time

## Technical Implementation

### Contract Addresses (Lisk Sepolia)
- **SmetReward**: `0xeF85822c30D194c2B2F7cC17223C64292Bfe611b`
- **SmetGold**: `0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2`
- **SmetHero**: `0x877D1FDa6a6b668b79ca4A42388E0825667d233E`
- **SmetLoot**: `0xa5046538c6338DC8b52a22675338a4623D4B5475`

### Blockchain Interactions
- **Read Operations**: Using `readContract` from wagmi
- **Write Operations**: Using `writeContract` and `waitForTransaction`
- **Event Listening**: Using `watchEvent` with viem public client
- **Error Handling**: Comprehensive blockchain error parsing

### Data Transformation
- **Blockchain to UI**: Convert contract structs to UI-friendly objects
- **Asset Type Mapping**: Map contract asset types to display names
- **Probability Calculation**: Convert weights to user-friendly percentages
- **Stock Tracking**: Real-time inventory from contract state

## User Experience Improvements

### 1. Real-time Feedback
- Transaction submission notifications
- Processing status updates
- Reward distribution confirmations
- Blockchain explorer links

### 2. Live Data
- Current reward pool inventory
- Real-time probability updates
- Dynamic fee display
- Instant stock updates

### 3. Error Handling
- Blockchain-specific error messages
- Transaction failure explanations
- Network connectivity issues
- Contract interaction problems

## Testing Coverage
- Unit tests for all blockchain services
- Mock contract interactions for testing
- Error scenario coverage
- Event listening functionality tests

## Performance Optimizations
- Efficient contract call batching
- Minimal blockchain reads
- Event-driven updates instead of polling
- Cached contract data where appropriate

## Security Considerations
- Input validation for all contract calls
- Proper error handling for failed transactions
- User confirmation for all blockchain operations
- Safe contract interaction patterns

## Future Enhancements
- Transaction history from blockchain events
- Advanced reward filtering and sorting
- Batch reward opening functionality
- Cross-chain compatibility
- Enhanced metadata fetching from IPFS