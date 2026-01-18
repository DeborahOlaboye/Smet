# Issue #89: Access Control for Mint Functions - Security Audit

## Issue Summary
Public mint() functions in SmetHero (ERC721) and SmetLoot (ERC1155) contracts allowed anyone to mint unlimited tokens, creating a critical security vulnerability that could destroy the game economy.

## Severity
**CRITICAL** - Allows unlimited token creation with no authorization

## Root Cause
Both NFT contracts had public `mint()` functions with no access control mechanisms:
- `SmetERC721.sol`: `mint()` function was `external` and `public`
- `SmetERC1155.sol`: `mint()` function was `external` and `public`

This allowed any address to create unlimited hero NFTs and loot items, breaking the reward economy.

## Solution Implemented

### 1. Access Control Architecture
Implemented a single-minter pattern with owner-controlled minter assignment:

#### Components:
- **Minter Address State Variable**: Stores the authorized minter contract address
- **setMinter() Function**: Allows owner to set/update the minter address
- **onlyMinter Modifier**: Restricts mint functions to the authorized minter only
- **MinterSet Event**: Emits when minter address is changed for transparency

### 2. Changes to SmetERC721.sol (SmetHero)

**New State Variable:**
```solidity
address public minter;
```

**New Modifier:**
```solidity
modifier onlyMinter() {
    require(msg.sender == minter, "Only minter can call this function");
    _;
}
```

**New Function:**
```solidity
function setMinter(address _minter) external onlyOwner {
    require(_minter != address(0), "Invalid minter address");
    minter = _minter;
    emit MinterSet(_minter);
}
```

**Updated mint() Function:**
```solidity
function mint(address to) external onlyMinter circuitBreakerCheck(this.mint.selector) returns (uint256 id)
```

### 3. Changes to SmetERC1155.sol (SmetLoot)

**Added Dependencies:**
- Imported `@openzeppelin/contracts/access/Ownable.sol`
- Added `Ownable` inheritance to contract

**New State Variable:**
```solidity
address public minter;
```

**New Modifier:**
```solidity
modifier onlyMinter() {
    require(msg.sender == minter, "Only minter can call this function");
    _;
}
```

**New Function:**
```solidity
function setMinter(address _minter) external onlyOwner {
    require(_minter != address(0), "Invalid minter address");
    minter = _minter;
    emit MinterSet(_minter);
}
```

**Updated mint() Function:**
```solidity
function mint(address to, uint256 id, uint256 amount) external onlyMinter circuitBreakerCheck(this.mint.selector)
```

## Security Guarantees

✅ **No Unauthorized Minting**: Only the owner-designated minter address can create tokens  
✅ **Owner Control**: Contract owner retains ability to update minter address  
✅ **Event Logging**: All minter changes are emitted as events for transparency  
✅ **Non-zero Validation**: Prevents setting minter to invalid address(0)  
✅ **Backward Compatible**: Existing token transfer and approval functions remain unchanged  

## Deployment Checklist

1. **Deploy Updated Contracts**
   - Deploy new SmetHero (SmetERC721) contract
   - Deploy new SmetLoot (SmetERC1155) contract

2. **Configure Minter Address**
   - Call `setMinter(smetRewardAddress)` on SmetHero contract
   - Call `setMinter(smetRewardAddress)` on SmetLoot contract

3. **Verification Steps**
   - Verify `minter` state variable returns SmetReward contract address
   - Test that SmetReward can mint tokens successfully
   - Test that non-SmetReward addresses cannot call mint()
   - Verify MinterSet events are emitted on setMinter() calls

4. **Update Frontend**
   - Update contract addresses in frontend configuration
   - Update ABI files if contract interfaces changed
   - Test reward claiming functionality end-to-end

## Testing Recommendations

### Unit Tests
```solidity
// Test 1: Only minter can mint
// Expect: Authorized minter can mint, others cannot

// Test 2: setMinter access control
// Expect: Only owner can call setMinter

// Test 3: setMinter validation
// Expect: Cannot set minter to address(0)

// Test 4: Event emission
// Expect: MinterSet event emitted when minter changes
```

### Integration Tests
1. Deploy SmetReward contract
2. Deploy SmetHero and SmetLoot contracts
3. Call setMinter with SmetReward address
4. Verify SmetReward can mint tokens
5. Verify non-SmetReward addresses cannot mint

## Migration Path

For existing deployments:

1. **Keep Old Contracts** (read-only)
2. **Deploy New Contracts** with access control
3. **Set Minter Address** to SmetReward contract
4. **Migrate Token Ownership** (if needed) through SmetReward
5. **Update Frontend** to use new contract addresses
6. **Deprecate Old Contracts** with documentation

## Audit Trail

| Contract | Change | Commit |
|----------|--------|--------|
| SmetERC721.sol | Add minter variable | 4ff4860 |
| SmetERC721.sol | Add setMinter() | 7bcb5d2 |
| SmetERC721.sol | Add onlyMinter modifier | 1115138 |
| SmetERC721.sol | Apply onlyMinter to mint() | 7177d6e |
| SmetERC721.sol | Add documentation | 558d668 |
| SmetERC1155.sol | Add Ownable, minter variable | 175b6dc |
| SmetERC1155.sol | Add setMinter() | b87254c |
| SmetERC1155.sol | Add onlyMinter modifier | 69877d7 |
| SmetERC1155.sol | Apply onlyMinter to mint() | f6b3e40 |
| SmetERC1155.sol | Add documentation | 5a85fc1 |

## References
- Issue: #89
- Smart Contract Best Practices: Access Control
- OpenZeppelin Ownable: https://docs.openzeppelin.com/contracts/4.x/access-control
