#!/bin/bash

echo "Running comprehensive test suite for Smet Gaming Ecosystem..."

# Install forge if not present
if ! command -v forge &> /dev/null; then
    echo "Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
fi

# Clean previous builds
echo "Cleaning previous builds..."
forge clean

# Install dependencies
echo "Installing dependencies..."
forge install

# Compile contracts
echo "Compiling contracts..."
forge build

# Run all tests with verbose output
echo "Running all tests..."
forge test -vvv

# Run tests with gas reporting
echo "Running tests with gas reporting..."
forge test --gas-report

# Run coverage analysis
echo "Running coverage analysis..."
forge coverage

# Run specific test files
echo "Running SmetReward tests..."
forge test --match-contract SmetRewardTest -vvv

echo "Running SmetERC20 tests..."
forge test --match-contract SmetERC20Test -vvv

echo "Running SmetERC721 tests..."
forge test --match-contract SmetERC721Test -vvv

echo "Running SmetERC1155 tests..."
forge test --match-contract SmetERC1155Test -vvv

echo "Test suite completed!"