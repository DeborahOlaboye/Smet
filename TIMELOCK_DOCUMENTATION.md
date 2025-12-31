# Timelock System Documentation

## Overview
The Timelock system adds an additional security layer to critical administrative functions by requiring a delay between proposing and executing transactions. This prevents immediate execution of potentially harmful operations and provides time for community review.

## Architecture

### Timelock Contract
- **Delay**: Configurable delay period (1 hour to 30 days)
- **Roles**: PROPOSER_ROLE, EXECUTOR_ROLE, CANCELLER_ROLE, DEFAULT_ADMIN_ROLE
- **Queue**: Transactions must be queued before execution
- **Expiration**: Queued transactions expire after 7 days

### Protected Functions
All critical administrative functions across the ecosystem are protected:

#### SmetReward
- `updateFee(uint256 newFee)` - Update reward opening fee
- `updateVRFConfig(...)` - Update Chainlink VRF parameters
- `addPrize(...)` - Add new prizes to the pool

#### SmetGold (ERC20)
- `mint(address to, uint256 amount)` - Mint new tokens

#### SmetHero (ERC721)
- `mint(address to)` - Mint new NFTs
- `setBaseURI(string memory baseURI)` - Update metadata URI

#### SmetLoot (ERC1155)
- `mint(address to, uint256 id, uint256 amount)` - Mint tokens
- `mintBatch(...)` - Batch mint tokens
- `setURI(string memory newURI)` - Update metadata URI

## Usage

### 1. Deploy Timelock
```bash
npx hardhat ignition deploy ignition/modules/Timelock.ts --network <network>
```

### 2. Setup Timelock Addresses
```bash
npx hardhat run scripts/setup-timelock.ts --network <network>
```

### 3. Queue a Transaction
```bash
# Using CLI
npx ts-node scripts/timelock-cli.ts queue-fee --timelock 0x123... --contract 0x456... --fee 0.01

# Using script
npx hardhat run scripts/timelock-manager.ts --network <network>
```

### 4. Execute Transaction (after delay)
```bash
npx ts-node scripts/timelock-cli.ts execute --timelock 0x123... --target 0x456... --data 0x789... --eta 1234567890
```

## Security Features

### Time Delay
- **Minimum**: 1 hour
- **Default**: 24 hours
- **Maximum**: 30 days
- Provides time for community review and intervention

### Role-Based Access
- **PROPOSER_ROLE**: Can queue transactions
- **EXECUTOR_ROLE**: Can execute queued transactions
- **CANCELLER_ROLE**: Can cancel queued transactions
- **DEFAULT_ADMIN_ROLE**: Can manage roles and update delay

### Transaction Expiration
- Queued transactions expire after 7 days
- Prevents indefinite pending transactions
- Requires re-queuing for expired transactions

### Reentrancy Protection
- All timelock functions are protected against reentrancy attacks
- Safe external calls with proper state management

## CLI Commands

### Queue Operations
```bash
# Queue fee update
npx ts-node timelock-cli.ts queue-fee --timelock 0x123... --contract 0x456... --fee 0.01

# Queue token mint
npx ts-node timelock-cli.ts queue-mint --timelock 0x123... --contract 0x456... --to 0x789... --amount 1000

# Queue VRF config update
npx ts-node timelock-cli.ts queue-vrf --timelock 0x123... --contract 0x456... --confirmations 3 --gasLimit 250000 --numWords 3

# Queue URI update
npx ts-node timelock-cli.ts queue-uri --timelock 0x123... --contract 0x456... --uri "https://new-uri.com/{id}.json"
```

### Execution Operations
```bash
# Execute queued transaction
npx ts-node timelock-cli.ts execute --timelock 0x123... --target 0x456... --data 0x789... --eta 1234567890

# Cancel queued transaction
npx ts-node timelock-cli.ts cancel --timelock 0x123... --target 0x456... --data 0x789... --eta 1234567890

# List pending transactions
npx ts-node timelock-cli.ts list --timelock 0x123...
```

## Best Practices

### 1. Role Management
- Use multi-sig wallets for role holders
- Separate proposer and executor roles
- Regular role audits and rotations

### 2. Transaction Queuing
- Always include descriptive transaction descriptions
- Verify transaction data before queuing
- Monitor queued transactions regularly

### 3. Community Governance
- Announce queued transactions publicly
- Provide rationale for proposed changes
- Allow community feedback during delay period

### 4. Emergency Procedures
- Maintain emergency cancellation capabilities
- Have backup plans for critical operations
- Regular testing of emergency procedures

## Integration Examples

### JavaScript/TypeScript
```typescript
import { TimelockManager } from "./scripts/timelock-manager";

const manager = new TimelockManager(timelockAddress);
await manager.initialize(timelockAddress);

// Queue a fee update
const txHash = await manager.queueFeeUpdate(smetRewardAddress, "0.01");

// Execute after delay
await manager.executeTransaction(target, value, data, eta);
```

### Smart Contract Integration
```solidity
contract MyContract {
    address public timelock;
    
    modifier onlyTimelock() {
        require(msg.sender == timelock, "Only timelock");
        _;
    }
    
    function criticalFunction() external onlyTimelock {
        // Critical operation
    }
}
```

## Monitoring and Alerts

### Event Monitoring
- `TransactionQueued` - New transaction queued
- `TransactionExecuted` - Transaction executed
- `TransactionCancelled` - Transaction cancelled
- `DelayChanged` - Delay period updated

### Health Checks
```bash
# Verify timelock setup
npx hardhat run scripts/setup-timelock.ts --network <network> -- --verify

# Monitor pending transactions
npx ts-node scripts/timelock-cli.ts list --timelock 0x123...
```

## Troubleshooting

### Common Issues
1. **Transaction not ready**: Wait for delay period to pass
2. **Transaction expired**: Re-queue the transaction
3. **Insufficient permissions**: Check role assignments
4. **Invalid delay**: Ensure delay is within min/max bounds

### Recovery Procedures
1. Use emergency cancellation for problematic transactions
2. Update roles if keys are compromised
3. Adjust delay if current setting is inappropriate
4. Deploy new timelock if contract is compromised

## Security Considerations

### Potential Risks
- **Admin key compromise**: Use multi-sig wallets
- **Long delays**: Balance security with operational needs
- **Transaction front-running**: Monitor mempool for malicious transactions
- **Role centralization**: Distribute roles across multiple parties

### Mitigation Strategies
- Regular security audits
- Multi-signature requirements
- Community oversight
- Emergency response procedures
- Backup governance mechanisms