// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "../contracts/SmetERC20.sol";

contract SmetGoldFuzz is Test {
    SmetGold gold;

    function setUp() public {
        gold = new SmetGold();
    }

    /// @notice Fuzz: transfers should not change total supply
    function test_transfer_preserves_totalSupply(address to, uint256 amount) public {
        vm.assume(to != address(0));
        uint256 bal = gold.balanceOf(address(this));
        vm.assume(amount <= bal);

        uint256 before = gold.totalSupply();
        gold.transfer(to, amount);
        assertEq(gold.totalSupply(), before);
    }

    /// @notice Basic sanity: minting set initial supply correctly
    function test_initial_supply() public {
        assertEq(gold.totalSupply(), 10000000 ether);
        assertEq(gold.balanceOf(address(this)), 10000000 ether);
    }
}
