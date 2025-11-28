# Smet Gaming Ecosystem

A blockchain-based gaming reward system that uses Chainlink VRF for provably fair random rewards.

## Contracts Overview

### Core Contracts
- **SmetReward** - Main reward distribution contract using Chainlink VRF for random prize selection
- **SmetGold** (ERC20) - In-game currency token with 10M initial supply
- **SmetHero** (ERC721) - Unique hero NFTs with sequential minting
- **SmetLoot** (ERC1155) - Multi-token loot items with metadata URI support

### How It Works
1. Players pay a fee to open reward boxes through `SmetReward.open()`
2. Chainlink VRF generates verifiable random numbers for fair prize selection
3. Rewards are distributed from a weighted prize pool containing ERC20, ERC721, or ERC1155 tokens
4. Contract supports refilling with additional tokens for ongoing gameplay

## Deployed Addresses

- **SmetGold** - `0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2`
- **SmetHero** - `0x877D1FDa6a6b668b79ca4A42388E0825667d233E`
- **SmetLoot** - `0xa5046538c6338DC8b52a22675338a4623D4B5475`
- **SmetReward** - `0xeF85822c30D194c2B2F7cC17223C64292Bfe611b`

## Verification

[View SmetLoot on Etherscan](https://sepolia-blockscout.lisk.com/address/0xa5046538c6338DC8b52a22675338a4623D4B5475)


[View SmetHero on Etherscan](https://sepolia-blockscout.lisk.com/address/0x877D1FDa6a6b668b79ca4A42388E0825667d233E)


[View SmetReward on Etherscan](https://sepolia-blockscout.lisk.com/address/0xeF85822c30D194c2B2F7cC17223C64292Bfe611b)


[View SmetGold on Etherscan](https://sepolia-blockscout.lisk.com/address/0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2)
