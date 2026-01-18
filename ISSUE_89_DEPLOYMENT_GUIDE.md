# Issue #89: Deployment Guide - Access Control for Mint Functions

## Overview
This guide provides step-by-step instructions for deploying the updated SmetHero (ERC721) and SmetLoot (ERC1155) contracts with access control implemented.

## Prerequisites

- **Deployment Account**: Must be the owner of both contracts
- **SmetReward Contract Address**: Address of the deployed SmetReward contract that will be authorized to mint
- **Web3 Connection**: Configured to the target blockchain (Ethereum, Polygon, etc.)
- **Sufficient Gas**: For deployment and configuration transactions
- **Contract ABIs**: Updated ABI files for the new contract versions

## Pre-Deployment Checklist

- [ ] Review all changes in ISSUE_89_SECURITY_AUDIT.md
- [ ] Backup current contract addresses (if upgrading)
- [ ] Verify SmetReward contract is deployed and working
- [ ] Test contracts on testnet first
- [ ] Prepare deployment scripts or use web interface
- [ ] Have sufficient native tokens for gas fees

## Deployment Steps

### Step 1: Deploy SmetHero Contract (ERC721)

**Using Hardhat (or similar framework):**

```javascript
const SmetHero = await ethers.getContractFactory("SmetHero");
const smetHero = await SmetHero.deploy("https://heroes.api.example/{id}.json");
await smetHero.waitForDeployment();
console.log("SmetHero deployed to:", await smetHero.getAddress());
```

**Using Foundry:**

```bash
forge create contract/contracts/SmetERC721.sol:SmetHero \
  --constructor-args "https://heroes.api.example/{id}.json" \
  --private-key $PRIVATE_KEY
```

**Contract Parameters:**
- `baseURI`: Base URI for token metadata (e.g., "https://api.smet.com/heroes/")

**Note:** After deployment, the `minter` state variable will be `address(0)` (not set).

### Step 2: Deploy SmetLoot Contract (ERC1155)

**Using Hardhat:**

```javascript
const SmetLoot = await ethers.getContractFactory("SmetLoot");
const smetLoot = await SmetLoot.deploy(transactionHistoryAddress);
await smetLoot.waitForDeployment();
console.log("SmetLoot deployed to:", await smetLoot.getAddress());
```

**Using Foundry:**

```bash
forge create contract/contracts/SmetERC1155.sol:SmetLoot \
  --constructor-args <TRANSACTION_HISTORY_ADDRESS> \
  --private-key $PRIVATE_KEY
```

**Contract Parameters:**
- `_transactionHistory`: Address of the TransactionHistory contract

**Note:** After deployment, the `minter` state variable will be `address(0)` (not set).

### Step 3: Configure Minter Address for SmetHero

**Execute setMinter() on SmetHero:**

```javascript
const smetHero = await ethers.getContractAt("SmetHero", SMET_HERO_ADDRESS);
const tx = await smetHero.setMinter(SMET_REWARD_ADDRESS);
await tx.wait();
console.log("SmetHero minter set to:", SMET_REWARD_ADDRESS);
```

**Using Etherscan/Web Interface:**
1. Go to SmetHero contract on Etherscan/Block Explorer
2. Click "Write Contract"
3. Connect wallet (must be owner)
4. Call function `setMinter`
5. Enter SmetReward contract address
6. Click "Write"
7. Confirm transaction

**Expected Event:**
```
MinterSet(address indexed newMinter)
```

### Step 4: Configure Minter Address for SmetLoot

**Execute setMinter() on SmetLoot:**

```javascript
const smetLoot = await ethers.getContractAt("SmetLoot", SMET_LOOT_ADDRESS);
const tx = await smetLoot.setMinter(SMET_REWARD_ADDRESS);
await tx.wait();
console.log("SmetLoot minter set to:", SMET_REWARD_ADDRESS);
```

**Using Etherscan/Web Interface:**
1. Go to SmetLoot contract on Etherscan/Block Explorer
2. Click "Write Contract"
3. Connect wallet (must be owner)
4. Call function `setMinter`
5. Enter SmetReward contract address
6. Click "Write"
7. Confirm transaction

**Expected Event:**
```
MinterSet(address indexed newMinter)
```

## Post-Deployment Verification

### Step 1: Verify Minter Addresses Set

**Check SmetHero minter:**

```javascript
const smetHero = await ethers.getContractAt("SmetHero", SMET_HERO_ADDRESS);
const minterAddress = await smetHero.minter();
console.log("SmetHero minter:", minterAddress);
console.assert(minterAddress.toLowerCase() === SMET_REWARD_ADDRESS.toLowerCase());
```

**Check SmetLoot minter:**

```javascript
const smetLoot = await ethers.getContractAt("SmetLoot", SMET_LOOT_ADDRESS);
const minterAddress = await smetLoot.minter();
console.log("SmetLoot minter:", minterAddress);
console.assert(minterAddress.toLowerCase() === SMET_REWARD_ADDRESS.toLowerCase());
```

### Step 2: Test Minting Authorization

**Test 1: Authorized Minting (Should Succeed)**

```javascript
const smetReward = await ethers.getContractAt("SmetReward", SMET_REWARD_ADDRESS);

// Mint through SmetReward
const tx = await smetReward.distributeReward(userAddress, smetHeroContractAddress);
await tx.wait();
console.log("✓ SmetReward can mint SmetHero tokens");
```

**Test 2: Unauthorized Minting (Should Fail)**

```javascript
const smetHero = await ethers.getContractAt("SmetHero", SMET_HERO_ADDRESS);
const randomAccount = ethers.Wallet.createRandom();

// Attempt direct mint from non-minter address
try {
  const tx = await smetHero.mint(userAddress);
  await tx.wait();
  console.error("✗ CRITICAL: Unauthorized account could mint!");
  process.exit(1);
} catch (error) {
  if (error.message.includes("Only minter can call")) {
    console.log("✓ Access control working: Unauthorized mint rejected");
  } else {
    console.error("✗ Unexpected error:", error.message);
  }
}
```

### Step 3: Verify Event Emission

**Check for MinterSet events:**

```bash
# Using Etherscan API
curl "https://api.etherscan.io/api?module=logs&action=getLogs&address=<SMET_HERO_ADDRESS>&topic0=<MinterSet_EVENT_SIGNATURE>&apikey=<ETHERSCAN_API_KEY>"

# Expected signature for MinterSet event:
# keccak256("MinterSet(address)")
# = 0x...
```

## Frontend Integration

### Update Configuration

**Before:**
```javascript
export const SMET_HERO_ADDRESS = "0x...old...";
export const SMET_LOOT_ADDRESS = "0x...old...";
```

**After:**
```javascript
export const SMET_HERO_ADDRESS = "0x...new...";
export const SMET_LOOT_ADDRESS = "0x...new...";
```

### Update Contract ABIs

Ensure frontend uses updated ABIs with:
- `minter` state variable
- `setMinter()` function
- `MinterSet` event

### Test Reward Claiming

1. Open reward claiming interface
2. Request reward/open loot box
3. Verify SmetReward can mint to new contracts
4. Check token appears in user wallet
5. Verify transaction history logged

## Rollback Plan

If critical issues are discovered:

### Immediate Actions
1. Pause SmetReward contract if possible
2. Do NOT distribute rewards while minter address is incorrect
3. Document issue details

### Rollback Steps
1. Deploy previous version of contracts
2. Update frontend to use old contract addresses
3. Verify old contracts are functional
4. Analyze issue and create fix

### Recovery Steps
1. Fix identified issues
2. Deploy corrected contracts
3. Reconfigure minter addresses
4. Resume reward distribution
5. Compensate affected users if necessary

## Monitoring

### Set Up Alerts

**Event Monitoring:**
- Alert on `MinterSet` events (unauthorized minter changes)
- Alert on failed mint attempts
- Monitor transaction history for anomalies

**Metrics to Track:**
- Successful mint transactions per day
- Failed mint attempt counts
- Minter address changes
- Contract upgrade events

### Log Review Checklist

After deployment and within first 24 hours:

- [ ] Verify no unauthorized setMinter() calls
- [ ] Confirm all user rewards were distributed successfully
- [ ] Check for any mint failures in logs
- [ ] Verify event emissions match expected changes
- [ ] Review transaction costs vs. baseline

## Troubleshooting

### Issue: setMinter() Transaction Fails

**Possible Causes:**
1. Caller is not owner
2. Provided address is invalid (address(0))
3. Insufficient gas
4. Network congestion

**Solutions:**
- Verify transaction is signed with owner account
- Check provided address is valid 20-byte address
- Increase gas limit
- Retry during lower network congestion

### Issue: Minting Still Works Without Authorization

**Possible Causes:**
1. Minter address not set (still address(0))
2. Wrong contract deployed (old version)
3. Transaction not confirmed

**Solutions:**
- Verify `minter` state variable is set to SmetReward address
- Check contract code matches updated version
- Confirm transaction reached block finality
- Check contract address matches deployment receipt

### Issue: Reward Claiming Fails

**Possible Causes:**
1. SmetHero/SmetLoot not minting because minter not set
2. Transaction history address invalid
3. Circuit breaker triggered
4. Insufficient contract balance

**Solutions:**
- Verify minter address configured on both contracts
- Check TransactionHistory contract is deployed and working
- Check circuit breaker status
- Verify contract has sufficient balance for distributions

## Success Criteria

Deployment is successful when:

✅ Both contracts deployed with correct addresses  
✅ Minter addresses set to SmetReward contract  
✅ MinterSet events emitted for both contracts  
✅ SmetReward can mint to both contracts  
✅ Non-SmetReward addresses cannot mint  
✅ Frontend updated and rewards claimable  
✅ No unauthorized minting detected  
✅ Event logs monitored for 24 hours  

## Additional Resources

- **ISSUE_89_SECURITY_AUDIT.md**: Detailed security analysis
- **Contract Source**: `contract/contracts/SmetERC721.sol`, `contract/contracts/SmetERC1155.sol`
- **OpenZeppelin Docs**: https://docs.openzeppelin.com/contracts/
- **Solidity Docs**: https://docs.soliditylang.org/

## Support

For deployment assistance:
1. Review this guide completely
2. Check troubleshooting section
3. Review security audit for additional context
4. Contact development team with specific error messages

---

**Last Updated**: 2026-01-18  
**Issue**: #89 - Access Control for Mint Functions  
**Status**: Ready for Deployment
