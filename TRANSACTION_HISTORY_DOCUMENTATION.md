# Transaction History System Documentation

## Overview

The Transaction History System provides comprehensive tracking of all user interactions with the Smet Gaming Ecosystem contracts. This system records every transaction across all contract types (ERC20, ERC721, ERC1155, and Reward contracts) and provides both on-chain storage and frontend interfaces for viewing transaction history.

## Architecture

### Smart Contracts

#### TransactionHistory Contract
The core contract that stores all transaction records on-chain.

**Key Features:**
- Records transactions from all integrated contracts
- Provides pagination for efficient data retrieval
- Maintains user-specific transaction mappings
- Emits events for real-time monitoring

**Storage Structure:**
```solidity
struct Transaction {
    address user;           // User who initiated the transaction
    address contractAddress; // Contract that was interacted with
    string action;          // Type of action performed
    uint256 amount;         // Amount involved (for ERC20/ERC1155)
    uint256 tokenId;        // Token ID (for ERC721/ERC1155)
    bytes32 txHash;         // Transaction hash reference
    uint256 timestamp;      // Block timestamp
    uint256 blockNumber;    // Block number
}
```

#### Contract Integration
All main contracts have been updated to integrate with the transaction history system:

- **SmetGold (ERC20)**: Tracks transfers, approvals, and minting
- **SmetHero (ERC721)**: Tracks minting, transfers, and approvals
- **SmetLoot (ERC1155)**: Tracks minting, transfers, and batch operations
- **SmetReward**: Tracks reward opening and claiming

### Frontend Components

#### TransactionHistory Component
Mobile-responsive React component that displays user transaction history with:
- Paginated transaction loading
- Mobile card view and desktop table view
- Real-time refresh functionality
- Action-based color coding

#### Transaction Service
TypeScript service that handles blockchain interaction:
- Fetches user transactions with pagination
- Formats data for display
- Provides contract name mapping
- Handles error states

## Tracked Actions

### ERC20 (SmetGold)
- `TRANSFER`: Token transfers between addresses
- `TRANSFER_FROM`: Delegated transfers via allowance
- `APPROVE`: Approval of spending allowances

### ERC721 (SmetHero)
- `MINT`: NFT minting to users
- `TRANSFER`: Direct NFT transfers
- `SAFE_TRANSFER`: Safe NFT transfers
- `SAFE_TRANSFER_DATA`: Safe transfers with additional data
- `APPROVE`: NFT approval for specific tokens
- `APPROVE_ALL`: Approval for all tokens to operator
- `REVOKE_ALL`: Revocation of operator approvals

### ERC1155 (SmetLoot)
- `MINT`: Multi-token minting
- `TRANSFER`: Single token transfers
- `BATCH_TRANSFER`: Multiple token transfers in one transaction
- `APPROVE_ALL`: Approval for all tokens to operator
- `REVOKE_ALL`: Revocation of operator approvals

### Reward System (SmetReward)
- `REWARD_OPEN`: Opening reward boxes
- `REWARD_CLAIM`: Claiming rewards from boxes
- `REFILL`: Contract refilling with tokens

## API Reference

### Smart Contract Functions

#### Recording Transactions
```solidity
function recordTransaction(
    address user,
    address contractAddress,
    string memory action,
    uint256 amount,
    uint256 tokenId
) external
```

#### Retrieving Transactions
```solidity
// Get user transactions with pagination
function getUserTransactionsPaginated(
    address user,
    uint256 offset,
    uint256 limit
) external view returns (Transaction[] memory)

// Get specific transaction
function getTransaction(uint256 transactionId) 
    external view returns (Transaction memory)

// Get user transaction count
function getUserTransactionCount(address user) 
    external view returns (uint256)

// Get total transaction count
function getTotalTransactions() external view returns (uint256)
```

### Frontend Service API

#### TransactionHistoryService
```typescript
// Initialize service
await transactionHistoryService.initialize(provider, contractAddress);

// Get user transactions
const transactions = await transactionHistoryService.getUserTransactions(
    userAddress, 
    offset, 
    limit
);

// Get transaction count
const count = await transactionHistoryService.getUserTransactionCount(userAddress);

// Get recent transactions
const recent = await transactionHistoryService.getRecentTransactions(limit);
```

## Usage Examples

### Viewing Transaction History
Users can view their transaction history by:
1. Connecting their wallet
2. Navigating to `/transactions` page
3. Browsing paginated transaction list
4. Filtering by action type or contract

### Real-time Monitoring
Administrators can monitor transactions in real-time:

```bash
# Start real-time monitoring
npx ts-node contract/scripts/transaction-monitor.ts start

# Generate activity report
npx ts-node contract/scripts/transaction-monitor.ts report

# View recent transactions
npx ts-node contract/scripts/transaction-monitor.ts recent 20
```

### Integration Example
```typescript
// Listen for new transactions
transactionHistory.on('TransactionRecorded', (
    transactionId,
    user,
    contractAddress,
    action,
    amount,
    tokenId
) => {
    console.log(`New ${action} by ${user}`);
});
```

## Mobile Responsiveness

The transaction history interface is fully mobile-responsive:

### Mobile Features
- **Card Layout**: Transactions displayed as cards on mobile devices
- **Touch-Friendly**: Large touch targets for all interactive elements
- **Responsive Tables**: Desktop table view with horizontal scrolling
- **Pull-to-Refresh**: Mobile-friendly refresh functionality
- **Infinite Scroll**: Load more transactions with pagination

### Responsive Breakpoints
- **Mobile** (< 640px): Card-based layout
- **Tablet** (640px - 1024px): Condensed table view
- **Desktop** (> 1024px): Full table with all columns

## Performance Considerations

### On-Chain Optimization
- **Efficient Storage**: Minimal storage footprint per transaction
- **Indexed Events**: Optimized event filtering and querying
- **Pagination**: Prevents large data retrieval operations

### Frontend Optimization
- **Lazy Loading**: Transactions loaded on demand
- **Caching**: Service-level caching for repeated queries
- **Debounced Refresh**: Prevents excessive API calls

## Security Features

### Access Control
- Only authorized contracts can record transactions
- Owner-only functions for system administration
- User privacy through address-based filtering

### Data Integrity
- Immutable transaction records
- Block number and timestamp verification
- Transaction hash references for validation

## Deployment

### Contract Deployment
```bash
# Deploy transaction history system
npx hardhat run contract/scripts/deploy-transaction-history.ts --network <network>
```

### Environment Setup
```bash
# Set transaction history contract address
export TRANSACTION_HISTORY_ADDRESS=0x...

# Initialize frontend service
await transactionHistoryService.initialize(provider, contractAddress);
```

## Testing

### Smart Contract Tests
```bash
# Run transaction history tests
npx hardhat test contract/test/TransactionHistory.test.ts
```

### Test Coverage
- Transaction recording across all contract types
- Pagination functionality
- User-specific transaction retrieval
- Event emission verification
- Access control validation

## Monitoring and Analytics

### Real-time Monitoring
- Live transaction feed
- Action-based filtering
- Contract-specific views
- User activity tracking

### Analytics Features
- Transaction volume metrics
- Popular action analysis
- User engagement statistics
- Contract usage patterns

### Alerting
- High-volume transaction alerts
- Unusual activity detection
- Error rate monitoring
- Performance threshold alerts

## Future Enhancements

### Planned Features
- **Advanced Filtering**: Date ranges, amount filters, multi-contract selection
- **Export Functionality**: CSV/JSON export of transaction history
- **Analytics Dashboard**: Visual charts and statistics
- **Notification System**: Real-time transaction notifications
- **Search Functionality**: Transaction search by hash, amount, or action

### Scalability Improvements
- **Off-chain Indexing**: External database for faster queries
- **Compression**: Transaction data compression for storage efficiency
- **Archival System**: Historical data archival for older transactions

## Best Practices

### Development Guidelines
1. **Consistent Action Names**: Use standardized action naming conventions
2. **Error Handling**: Implement comprehensive error handling
3. **Gas Optimization**: Minimize gas costs for transaction recording
4. **Event Indexing**: Properly index events for efficient querying

### User Experience
1. **Loading States**: Show appropriate loading indicators
2. **Error Messages**: Provide clear error messages and recovery options
3. **Responsive Design**: Ensure functionality across all device sizes
4. **Performance**: Optimize for fast loading and smooth interactions