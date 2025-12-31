// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

library InputValidator {
    error InvalidAddress();
    error InvalidAmount();
    error InvalidArrayLength();
    error ArrayLengthMismatch();
    error InvalidTokenId();
    error InvalidAssetType();
    
    function validateAddress(address addr) internal pure {
        if (addr == address(0)) revert InvalidAddress();
    }
    
    function validateAmount(uint256 amount) internal pure {
        if (amount == 0) revert InvalidAmount();
    }
    
    function validateArrayLength(uint256 length) internal pure {
        if (length == 0) revert InvalidArrayLength();
    }
    
    function validateArrayLengths(uint256 length1, uint256 length2) internal pure {
        if (length1 != length2) revert ArrayLengthMismatch();
    }
    
    function validateAssetType(uint8 assetType) internal pure {
        if (assetType < 1 || assetType > 3) revert InvalidAssetType();
    }
    
    function validateGasLimit(uint256 gasLimit) internal pure {
        if (gasLimit < 21000 || gasLimit > 5000000) revert InvalidAmount();
    }
    
    function validateBatchSize(uint256 size) internal pure {
        if (size > 100) revert InvalidAmount();
    }
}