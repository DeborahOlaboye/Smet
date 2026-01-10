# Circuit Breaker Pattern Documentation

## Overview

The Circuit Breaker Pattern is implemented across all Smet Gaming Ecosystem contracts to provide emergency pause functionality for specific contract functions during critical situations.

## Architecture

### Core Components

1. **ICircuitBreaker Interface** - Defines the standard circuit breaker functionality
2. **CircuitBreaker Contract** - Base implementation with function-specific breaking
3. **EmergencyCircuitBreakerManager** - Coordinated emergency response across multiple contracts
4. **Token Contract Integration** - Circuit breaker functionality in ERC20, ERC721, and ERC1155 tokens

### Function-Specific Circuit Breaking

Unlike traditional pause mechanisms that disable entire contracts, our circuit breaker pattern allows granular control over individual functions using their selectors.

## Contract Integration

### SmetGold (ERC20)
Protected functions:
- `transfer(address,uint256)` - Selector: `0xa9059cbb`
- `transferFrom(address,address,uint256)` - Selector: `0x23b872dd`
- `approve(address,uint256)` - Selector: `0x095ea7b3`

### SmetHero (ERC721)
Protected functions:
- `mint(address)` - Selector: `0x40c10f19`
- `transferFrom(address,address,uint256)` - Selector: `0x23b872dd`
- `safeTransferFrom(address,address,uint256)` - Selector: `0x42842e0e`
- `approve(address,uint256)` - Selector: `0x095ea7b3`
- `setApprovalForAll(address,bool)` - Selector: `0xa22cb465`

### SmetLoot (ERC1155)
Protected functions:
- `mint(address,uint256,uint256)` - Selector: `0x731133e9`
- `safeTransferFrom(address,address,uint256,uint256,bytes)` - Selector: `0xf242432a`
- `safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)` - Selector: `0x2eb2c2d6`
- `setApprovalForAll(address,bool)` - Selector: `0xa22cb465`

### SmetReward
Protected functions:
- `open(bool)` - Selector: `0x6e553f65`
- `refill(address,uint256)` - Selector: `0x5d098b69`

## Usage

### Breaking a Circuit

```solidity
// Break the transfer function
contract.breakCircuit(0xa9059cbb);
```

### Restoring a Circuit

```solidity
// Restore the transfer function (owner only)
contract.restoreCircuit(0xa9059cbb);
```

### Emergency Operations

```solidity
// Break all registered contracts for a specific function
emergencyManager.emergencyBreakAll(0xa9059cbb);

// Restore all registered contracts for a specific function
emergencyManager.emergencyRestoreAll(0xa9059cbb);
```

## CLI Tools

### Circuit Breaker CLI

```bash
# Break a circuit
npx ts-node contract/scripts/circuit-breaker-cli.ts break -c <contract_address> -f <function_selector>

# Restore a circuit
npx ts-node contract/scripts/circuit-breaker-cli.ts restore -c <contract_address> -f <function_selector>

# Check status
npx ts-node contract/scripts/circuit-breaker-cli.ts status -c <contract_address>

# Emergency break all
npx ts-node contract/scripts/circuit-breaker-cli.ts emergency-break-all -m <manager_address> -f <function_selector>
```

## Monitoring

### Real-time Monitoring

```typescript
import { CircuitBreakerMonitor } from './scripts/circuit-breaker-monitor';

const monitor = new CircuitBreakerMonitor();
await monitor.addContract('SmetGold', goldAddress, goldAbi);
await monitor.checkAllCircuitStatus();
```

## Security Considerations

1. **Authorization**: Only authorized breakers can break circuits
2. **Restoration**: Only contract owners can restore circuits
3. **Emergency Operators**: Special role for emergency situations
4. **Event Logging**: All circuit breaker actions are logged for audit trails

## Deployment

```bash
# Deploy circuit breaker system
npx hardhat run contract/scripts/deploy-circuit-breaker.ts --network <network>
```

## Testing

```bash
# Run circuit breaker tests
npx hardhat test contract/test/CircuitBreaker.test.ts
npx hardhat test contract/test/EmergencyCircuitBreakerManager.test.ts
npx hardhat test contract/test/TokenCircuitBreaker.test.ts
```

## Events

### CircuitBreaker Events
- `CircuitBroken(bytes4 indexed functionSelector, address indexed breaker)`
- `CircuitRestored(bytes4 indexed functionSelector, address indexed restorer)`
- `BreakerAuthorized(address indexed breaker)`
- `BreakerRevoked(address indexed breaker)`

### EmergencyManager Events
- `ContractRegistered(address indexed contractAddress, string name)`
- `ContractDeregistered(address indexed contractAddress)`
- `EmergencyBreakAll(address indexed operator)`
- `EmergencyRestoreAll(address indexed operator)`
- `OperatorAdded(address indexed operator)`
- `OperatorRemoved(address indexed operator)`

## Best Practices

1. **Granular Control**: Use function-specific breaking rather than contract-wide pausing
2. **Quick Response**: Authorize trusted operators for emergency situations
3. **Monitoring**: Implement real-time monitoring for circuit breaker events
4. **Documentation**: Maintain clear documentation of function selectors and their purposes
5. **Testing**: Regularly test circuit breaker functionality in staging environments