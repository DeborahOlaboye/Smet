# Dynamic Reward Pool Management Documentation

## Overview

The enhanced SmetReward contract now supports dynamic reward pool management, allowing administrators to add, remove, and update rewards without redeploying the contract.

## New Features

### 🎯 Core Management Functions

#### Add Rewards
```solidity
function addReward(Reward memory reward, uint32 weight) external onlyOwner
```
- Adds a new reward to the pool with specified weight
- Automatically updates the cumulative distribution function (CDF)
- Emits `RewardAdded` event

#### Remove Rewards
```solidity
function removeReward(uint256 index) external onlyOwner
```
- Removes reward at specified index
- Rebuilds CDF to maintain probability distribution
- Emits `RewardRemoved` event

#### Update Rewards
```solidity
function updateReward(uint256 index, Reward memory reward, uint32 weight) external onlyOwner
```
- Updates existing reward at specified index
- Rebuilds CDF with new weight
- Emits `RewardUpdated` event

#### Update Weights
```solidity
function updateWeights(uint32[] memory weights) external onlyOwner
```
- Updates all reward weights simultaneously
- Rebuilds entire CDF
- Emits `WeightsUpdated` event

#### Update Fee
```solidity
function updateFee(uint256 newFee) external onlyOwner
```
- Updates the opening fee for reward boxes
- Emits `FeeUpdated` event

### 🚀 Batch Operations

#### Batch Add Rewards
```solidity
function addRewardsBatch(Reward[] memory rewards, uint32[] memory weights) external onlyOwner
```
- Adds multiple rewards in a single transaction
- More gas-efficient for bulk operations

#### Batch Remove Rewards
```solidity
function removeRewardsBatch(uint256[] memory indices) external onlyOwner
```
- Removes multiple rewards by indices
- Automatically sorts indices to prevent shifting issues

### 🔒 Emergency Controls

#### Pause/Unpause
```solidity
function pause() external onlyOwner
function unpause() external onlyOwner
```
- Pauses/unpauses reward box opening
- Emergency stop functionality

#### Emergency Withdrawals
```solidity
function emergencyWithdraw(address token, uint256 amount) external onlyOwner
function emergencyWithdrawNFT(address token, uint256 tokenId) external onlyOwner
function emergencyWithdraw1155(address token, uint256 tokenId, uint256 amount) external onlyOwner
```
- Emergency withdrawal of tokens/NFTs
- Owner-only access for contract recovery

### 📊 Advanced Management

#### Stock Management
```solidity
function setRewardStock(uint256 index, uint256 newStock) external onlyOwner
function getRewardStock(address token, uint256 tokenId) external view returns (uint256)
```
- Update ERC20 reward amounts
- Check current token balances

### 🔍 View Functions

#### Get Reward Information
```solidity
function getRewardCount() external view returns (uint256)
function getReward(uint256 index) external view returns (Reward memory)
function getAllRewards() external view returns (Reward[] memory)
function getWeights() external view returns (uint32[] memory)
```

## Usage Examples

### Adding New Rewards

```javascript
// Add ERC20 reward
const goldReward = {
  assetType: 1,
  token: goldTokenAddress,
  idOrAmount: ethers.parseEther("500")
};
await smetReward.addReward(goldReward, 75);

// Add ERC721 reward
const heroReward = {
  assetType: 2,
  token: heroNftAddress,
  idOrAmount: 1
};
await smetReward.addReward(heroReward, 25);

// Add ERC1155 reward
const lootReward = {
  assetType: 3,
  token: lootTokenAddress,
  idOrAmount: 77
};
await smetReward.addReward(lootReward, 50);
```

### Updating Reward Weights

```javascript
// Update weights for better distribution
const newWeights = [60, 30, 10]; // 60%, 30%, 10%
await smetReward.updateWeights(newWeights);
```

### Batch Operations

```javascript
// Add multiple rewards at once
const batchRewards = [
  { assetType: 1, token: goldAddress, idOrAmount: ethers.parseEther("100") },
  { assetType: 1, token: goldAddress, idOrAmount: ethers.parseEther("1000") }
];
const batchWeights = [70, 30];
await smetReward.addRewardsBatch(batchRewards, batchWeights);
```

### Emergency Management

```javascript
// Pause contract in emergency
await smetReward.pause();

// Emergency withdraw tokens
await smetReward.emergencyWithdraw(tokenAddress, amount);

// Resume operations
await smetReward.unpause();
```

## Deployment

### Using Hardhat Ignition

```bash
# Deploy with dynamic management
npm run deploy:dynamic

# Manage rewards after deployment
npm run manage:rewards
```

### Manual Deployment

```javascript
const smetReward = await ethers.deployContract("SmetReward", [
  vrfCoordinator,
  subscriptionId,
  keyHash,
  fee,
  initialWeights,
  initialPrizes
]);
```

## Security Considerations

### Access Control
- All management functions are `onlyOwner`
- Emergency functions require owner privileges
- Pause functionality for emergency stops

### Validation
- Weight validation (must be > 0)
- Asset type validation (1-3 only)
- Array length matching for batch operations
- Index bounds checking

### Gas Optimization
- Batch operations for efficiency
- Minimal storage updates
- Event emission for off-chain tracking

## Events

```solidity
event RewardAdded(uint256 indexed index, Reward reward, uint32 weight);
event RewardRemoved(uint256 indexed index);
event RewardUpdated(uint256 indexed index, Reward reward, uint32 weight);
event WeightsUpdated();
event FeeUpdated(uint256 newFee);
```

## Testing

### Run Dynamic Management Tests
```bash
# Test dynamic reward management
forge test --match-contract SmetDynamicRewardTest -vvv

# Test with coverage
forge coverage --match-contract SmetDynamicRewardTest
```

### Test Categories
- ✅ Add/Remove/Update rewards
- ✅ Weight management
- ✅ Batch operations
- ✅ Access control
- ✅ Emergency functions
- ✅ Edge cases
- ✅ Integration scenarios

## Migration Guide

### From Static to Dynamic

1. **Deploy New Contract**: Use `SmetRewardDynamic.ts` module
2. **Transfer Assets**: Move tokens/NFTs to new contract
3. **Configure Rewards**: Use management functions to set up reward pool
4. **Update Frontend**: Point to new contract address
5. **Test Thoroughly**: Verify all functionality works

### Backward Compatibility

The enhanced contract maintains full backward compatibility with existing functionality while adding new management capabilities.

## Best Practices

### Reward Management
- Start with conservative weights
- Monitor reward distribution patterns
- Adjust weights based on gameplay data
- Keep emergency withdrawal capabilities

### Security
- Use multi-sig for owner operations
- Test all changes on testnet first
- Monitor contract events
- Have emergency procedures ready

### Gas Optimization
- Use batch operations for multiple changes
- Update weights infrequently
- Consider gas costs in reward design