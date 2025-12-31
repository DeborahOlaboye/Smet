# Smet Gaming Ecosystem

A blockchain-based gaming reward system that uses Chainlink VRF for provably fair random rewards.

## Contracts Overview

### Core Contracts
- **SmetReward** - Main reward distribution contract using Chainlink VRF for random prize selection
- **SmetGold** (ERC20) - In-game currency token with 10M initial supply
- **SmetHero** (ERC721) - Unique hero NFTs with sequential minting
- **SmetLoot** (ERC1155) - Multi-token loot items with metadata URI support

### Security Infrastructure
- **Timelock** - Time-delayed execution for critical administrative functions
- **EmergencyRecovery** - Multi-sig emergency recovery contract for critical situations
- **CircuitBreaker** - Automated circuit breaker for emergency operation controls
- All contracts include pause/unpause functionality and emergency withdrawal capabilities

### Upgradeability
- **UUPS Proxy Pattern** - All contracts are upgradeable using OpenZeppelin's UUPS standard
- **Governance Integration** - Upgrade proposals managed through governance system
- **State Preservation** - Contract addresses and state maintained across upgrades
- See [Upgradeability Documentation](./UPGRADEABILITY_DOCUMENTATION.md)

### How It Works
1. Players pay a fee to open reward boxes through `SmetReward.open()`
2. Chainlink VRF generates verifiable random numbers for fair prize selection
3. Rewards are distributed from a weighted prize pool containing ERC20, ERC721, or ERC1155 tokens
4. Contract supports refilling with additional tokens for ongoing gameplay

## Security Features

🔒 **Timelock Protection**: Critical functions require 24-hour delay
- Fee updates, minting operations, and configuration changes
- Community review period before execution
- See [Timelock Documentation](./TIMELOCK_DOCUMENTATION.md)

🚨 **Emergency Procedures**: Comprehensive emergency response system
- [Emergency Recovery Plan](./EMERGENCY_RECOVERY_PLAN.md)
- [Quick Reference Guide](./EMERGENCY_QUICK_REFERENCE.md)

🔄 **Upgradeability**: Future-proof contract system
- UUPS proxy pattern for seamless upgrades
- Governance-controlled upgrade process
- State and address preservation

📊 **Event Monitoring**: Real-time activity tracking
- Comprehensive event monitoring across all contracts
- Real-time alerts and notifications
- Web dashboard for analytics and insights
- See [Event Monitoring Documentation](./EVENT_MONITORING_DOCUMENTATION.md)

## Deployed Addresses

### Current Contracts
- **SmetGold** - `0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2`
- **SmetHero** - `0x877D1FDa6a6b668b79ca4A42388E0825667d233E`
- **SmetLoot** - `0xa5046538c6338DC8b52a22675338a4623D4B5475`
- **SmetReward** - `0xeF85822c30D194c2B2F7cC17223C64292Bfe611b`

### Upgradeable Versions
*Deploy using:* `npx hardhat run scripts/deploy-upgradeable.ts --network <network>`

## Monitoring

### Start Monitoring
```bash
# Real-time monitoring
npx ts-node contract/scripts/monitor-cli.ts start

# Web dashboard
npx ts-node contract/scripts/monitor-cli.ts dashboard
```

### Docker Deployment
```bash
# Start monitoring stack
docker-compose -f contract/docker-compose.monitor.yml up -d
```

## Verification

[View SmetLoot on Etherscan](https://sepolia-blockscout.lisk.com/address/0xa5046538c6338DC8b52a22675338a4623D4B5475)

[View SmetHero on Etherscan](https://sepolia-blockscout.lisk.com/address/0x877D1FDa6a6b668b79ca4A42388E0825667d233E)

[View SmetReward on Etherscan](https://sepolia-blockscout.lisk.com/address/0xeF85822c30D194c2B2F7cC17223C64292Bfe611b)

[View SmetGold on Etherscan](https://sepolia-blockscout.lisk.com/address/0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2)