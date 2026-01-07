// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "./SmetERC20.sol";

contract SmetERC20Test is Test {
    SmetGold gold;
    
    address owner = address(this);
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    
    function setUp() external {
        gold = new SmetGold();
    }
    
    function test_initialSupply() external {
        assertEq(gold.totalSupply(), 10000000 ether);
        assertEq(gold.balanceOf(owner), 10000000 ether);
    }
    
    function test_transfer() external {
        gold.transfer(alice, 1000 ether);
        assertEq(gold.balanceOf(alice), 1000 ether);
        assertEq(gold.balanceOf(owner), 10000000 ether - 1000 ether);
    }
    
    function test_transferInsufficientBalance_reverts() external {
        vm.prank(alice);
        vm.expectRevert();
        gold.transfer(bob, 1 ether);
    }
    
    function test_approve() external {
        gold.approve(alice, 1000 ether);
        assertEq(gold.allowance(owner, alice), 1000 ether);
    }
    
    function test_transferFrom() external {
        gold.approve(alice, 1000 ether);
        
        vm.prank(alice);
        gold.transferFrom(owner, bob, 500 ether);
        
        assertEq(gold.balanceOf(bob), 500 ether);
        assertEq(gold.allowance(owner, alice), 500 ether);
    }
    
    function test_transferFromInsufficientAllowance_reverts() external {
        gold.approve(alice, 100 ether);
        
        vm.prank(alice);
        vm.expectRevert();
        gold.transferFrom(owner, bob, 200 ether);
    }
    
    function test_tokenMetadata() external {
        assertEq(gold.name(), "SmetGold");
        assertEq(gold.symbol(), "SGOLD");
        assertEq(gold.decimals(), 18);
    }
}