# Formal Verification Specifications

## SmetGold (ERC20) Invariants

### Total Supply Conservation
- **Property**: `totalSupply()` remains constant after transfers
- **Verification**: Mathematical proof that sum of all balances equals total supply

### Balance Conservation  
- **Property**: For any transfer, sender balance decreases by amount and recipient balance increases by amount
- **Verification**: `balanceOf(sender)_after = balanceOf(sender)_before - amount`

### Allowance Correctness
- **Property**: Approved allowances are set correctly
- **Verification**: `allowance(owner, spender) == approvedAmount`

## SmetHero (ERC721) Invariants

### Unique Token IDs
- **Property**: Each minted token has a unique, sequential ID
- **Verification**: `nextId` increments by 1 for each mint

### Ownership Transfer
- **Property**: Token ownership transfers correctly
- **Verification**: `ownerOf(tokenId)` changes from sender to recipient

### Mint Counter Accuracy
- **Property**: Total minted count matches actual mints
- **Verification**: `totalMinted` increments by 1 for each successful mint

## SmetLoot (ERC1155) Invariants

### Balance Conservation
- **Property**: Token balances are conserved during transfers
- **Verification**: Sum of balances remains constant per token ID

### Supply Tracking
- **Property**: Total supply per token ID is accurately tracked
- **Verification**: `totalSupplyById[id]` increases by mint amount

## SmetReward Invariants

### Fee Collection
- **Property**: Correct fee is collected for each reward box opening
- **Verification**: `msg.value == fee`

### Random Distribution
- **Property**: Rewards are distributed according to weighted probabilities
- **Verification**: Index selection within valid bounds

### Request Tracking
- **Property**: Each VRF request is properly tracked
- **Verification**: `waiting[reqId]` maps to correct opener

### Reward Delivery
- **Property**: Rewards are delivered to correct recipients
- **Verification**: Asset type validation and transfer completion

## Mathematical Proofs

### Conservation Laws
1. **Token Conservation**: ∑(balances) = constant (for transfers)
2. **Supply Conservation**: totalSupply = ∑(all_balances)
3. **ID Uniqueness**: ∀ tokenId, ∃! owner

### Bounds Checking
1. **Array Bounds**: All array accesses within valid indices
2. **Asset Type**: assetType ∈ {1, 2, 3}
3. **Amount Validation**: amount > 0 for all operations

### State Consistency
1. **Pre/Post Conditions**: State changes follow expected patterns
2. **Invariant Preservation**: Critical invariants maintained across operations
3. **Error Handling**: Invalid states trigger appropriate reverts