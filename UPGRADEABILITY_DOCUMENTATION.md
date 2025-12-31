# Upgradeability Documentation

## Overview
The Smet Gaming Ecosystem implements upgradeability using OpenZeppelin's UUPS (Universal Upgradeable Proxy Standard) pattern. This allows for future improvements and bug fixes while preserving contract addresses and state.

## Architecture

### UUPS Proxy Pattern
- **Proxy Contract**: Holds state and delegates calls to implementation
- **Implementation Contract**: Contains the logic
- **Admin**: Controls upgrade authorization (contract owner)

### Upgradeable Contracts
All core contracts have upgradeable versions:
- `SmetRewardUpgradeable` - Main reward distribution
- `SmetGoldUpgradeable` - ERC20 token
- `SmetHeroUpgradeable` - ERC721 NFTs
- `SmetLootUpgradeable` - ERC1155 tokens

## Key Features

### Initialization
- Uses `initialize()` instead of constructor
- Prevents re-initialization attacks
- Implementation contracts have initializers disabled

### Access Control
- Only contract owner can authorize upgrades
- `_authorizeUpgrade()` function controls upgrade permissions
- Timelock integration for critical functions

### State Preservation
- All state variables preserved during upgrades
- Proxy address remains constant
- User interactions uninterrupted

## Deployment

### Initial Deployment
```bash
# Deploy all upgradeable contracts
npx hardhat run scripts/deploy-upgradeable.ts --network <network>

# Or using Ignition
npx hardhat ignition deploy ignition/modules/Upgradeable.ts --network <network>
```

### Upgrade Process
```bash
# Validate upgrade compatibility
npx ts-node scripts/upgrade-manager.ts validate

# Prepare upgrade (deploy new implementation)
npx ts-node scripts/upgrade-manager.ts prepare <proxy> <contract>

# Execute upgrade
npx ts-node scripts/upgrade-manager.ts upgrade
```

## Usage Examples

### JavaScript/TypeScript
```typescript
import { ethers, upgrades } from "hardhat";

// Deploy upgradeable contract
const Contract = await ethers.getContractFactory("SmetGoldUpgradeable");
const proxy = await upgrades.deployProxy(Contract, [], {
  initializer: "initialize",
  kind: "uups"
});

// Upgrade contract
const ContractV2 = await ethers.getContractFactory("SmetGoldUpgradeableV2");
const upgraded = await upgrades.upgradeProxy(proxy, ContractV2);
```

### Solidity
```solidity
contract SmetGoldUpgradeableV2 is SmetGoldUpgradeable {
    // New state variables must be added at the end
    uint256 public newFeature;
    
    // New functions can be added
    function setNewFeature(uint256 _value) external onlyOwner {
        newFeature = _value;
    }
    
    // Existing functions can be modified (carefully)
    function mint(address to, uint256 amount) external override onlyTimelock {
        super.mint(to, amount);
        // Additional logic
    }
}
```

## Upgrade Safety

### Storage Layout Rules
1. **Never remove or reorder existing variables**
2. **Only add new variables at the end**
3. **Don't change variable types**
4. **Use storage gaps for future expansion**

### Function Modifications
1. **Can add new functions**
2. **Can modify existing function logic**
3. **Cannot change function signatures**
4. **Cannot remove public functions**

### Validation Process
```bash
# Always validate before upgrading
npx hardhat run scripts/upgrade-manager.ts validate

# Check specific upgrade
await upgrades.validateUpgrade(proxyAddress, NewContractFactory);
```

## Governance Integration

### UpgradeGovernance Contract
- Multi-signature approval for upgrades
- Time-delayed execution
- Voting mechanism for upgrade decisions
- Emergency cancellation capabilities

### Governance Process
1. **Propose**: Submit upgrade proposal
2. **Vote**: Community/multisig voting period
3. **Queue**: Approved proposals enter execution queue
4. **Execute**: Execute upgrade after delay

## Security Considerations

### Access Control
- Owner-only upgrade authorization
- Timelock integration for critical changes
- Multi-signature governance for major upgrades

### Upgrade Validation
- Automatic storage layout validation
- Function signature compatibility checks
- Implementation contract verification

### Emergency Procedures
- Pause functionality in all contracts
- Emergency upgrade cancellation
- Rollback capabilities through governance

## Best Practices

### Development
1. **Always use storage gaps**
2. **Test upgrades on testnets first**
3. **Validate storage layouts**
4. **Document all changes**

### Deployment
1. **Use deterministic deployments**
2. **Verify all contracts on explorers**
3. **Set up proper access controls**
4. **Configure governance systems**

### Monitoring
1. **Monitor upgrade events**
2. **Track implementation changes**
3. **Verify state preservation**
4. **Test functionality post-upgrade**

## CLI Commands

### Deployment
```bash
# Deploy upgradeable contracts
npx hardhat run scripts/deploy-upgradeable.ts --network mainnet

# Get contract info
npx ts-node scripts/upgrade-manager.ts info 0x123...
```

### Upgrades
```bash
# Validate all upgrades
npx ts-node scripts/upgrade-manager.ts validate

# Upgrade all contracts
npx ts-node scripts/upgrade-manager.ts upgrade

# Prepare specific upgrade
npx ts-node scripts/upgrade-manager.ts prepare 0x123... SmetGoldUpgradeable
```

## Storage Layout Example

```solidity
contract SmetGoldUpgradeable {
    // Slot 0-50: OpenZeppelin upgradeable contracts
    // Slot 51: timelock
    address public timelock;
    
    // Slot 52-99: Reserved for future use
    uint256[48] private __gap;
    
    // Slot 100+: Future versions can use these slots
}
```

## Troubleshooting

### Common Issues
1. **Storage collision**: Use storage gaps and proper layout
2. **Initialization errors**: Check initializer modifiers
3. **Access denied**: Verify owner permissions
4. **Validation failures**: Check storage layout compatibility

### Recovery Procedures
1. **Pause contracts** if issues detected
2. **Use governance** to cancel problematic upgrades
3. **Deploy hotfixes** through emergency procedures
4. **Rollback** to previous implementation if necessary

## Testing

### Upgrade Tests
```typescript
// Test upgrade compatibility
await upgrades.validateUpgrade(proxy, NewContract);

// Test state preservation
const stateBefore = await proxy.someState();
await upgrades.upgradeProxy(proxy, NewContract);
const stateAfter = await proxy.someState();
expect(stateAfter).to.equal(stateBefore);
```

### Integration Tests
- Test all functions post-upgrade
- Verify event emissions
- Check access controls
- Validate state consistency

## Monitoring and Alerts

### Events to Monitor
- `Upgraded(address implementation)` - New implementation deployed
- `AdminChanged(address admin)` - Admin role transferred
- `BeaconUpgraded(address beacon)` - Beacon upgrades (if used)

### Health Checks
- Verify proxy points to correct implementation
- Check admin permissions
- Validate contract functionality
- Monitor gas usage changes