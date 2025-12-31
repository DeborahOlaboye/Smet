# Input Validation Implementation

## Overview
Comprehensive input validation has been implemented across all contracts to prevent invalid inputs and potential vulnerabilities.

## Validation Library
The `InputValidator` library provides centralized validation functions:

### Core Validations
- `validateAddress(address)` - Ensures address is not zero
- `validateAmount(uint256)` - Ensures amount is greater than zero
- `validateArrayLength(uint256)` - Ensures array is not empty
- `validateArrayLengths(uint256, uint256)` - Ensures arrays have matching lengths
- `validateAssetType(uint8)` - Ensures asset type is 1, 2, or 3
- `validateGasLimit(uint256)` - Ensures gas limit is within safe bounds
- `validateBatchSize(uint256)` - Ensures batch operations don't exceed 100 items

## Contract-Specific Validations

### SmetGold (ERC20)
- **transfer()**: Validates recipient address and amount
- **transferFrom()**: Validates sender, recipient addresses and amount
- **approve()**: Validates spender address
- **batchTransfer()**: Validates arrays, addresses, amounts, and batch size
- **batchApprove()**: Validates arrays, addresses, and batch size

### SmetHero (ERC721)
- **mint()**: Validates recipient address
- **transferFrom()**: Validates sender and recipient addresses
- **safeTransferFrom()**: Validates sender and recipient addresses
- **approve()**: Validates spender address
- **batchMint()**: Validates array and addresses with batch size limits
- **batchTransfer()**: Validates arrays, addresses, and batch size

### SmetLoot (ERC1155)
- **mint()**: Validates recipient address and amount
- **safeTransferFrom()**: Validates addresses and amount
- **safeBatchTransferFrom()**: Validates arrays, addresses, and amounts
- **setApprovalForAll()**: Validates operator address
- **batchMint()**: Validates arrays, addresses, amounts, and batch size
- **batchTransfer()**: Validates arrays, addresses, amounts, and batch size

### SmetReward
- **Constructor**: Validates coordinator address, fee, arrays, asset types
- **open()**: Validates payment amount
- **refill()**: Validates token address and amount
- **batchOpen()**: Validates count, payment amount, and batch limits
- **batchRefill()**: Validates arrays, addresses, amounts, and batch size

## Security Features

### Gas Optimization
- Batch size limits prevent gas limit issues
- Early validation reduces wasted gas on failed transactions

### DoS Protection
- Array length limits prevent denial of service attacks
- Maximum batch size of 100 items per operation

### Input Sanitization
- Zero address checks prevent accidental burns
- Amount validation prevents zero-value operations
- Array length matching prevents index out of bounds

### Custom Errors
- Gas-efficient custom errors instead of string messages
- Clear error types for better debugging

## Validation Flow
1. **Pre-execution**: All inputs validated before state changes
2. **Array Validation**: Length and content validation for batch operations
3. **Address Validation**: Zero address checks for all address parameters
4. **Amount Validation**: Positive amount checks for all value transfers
5. **Bounds Checking**: Array indices and batch sizes within limits