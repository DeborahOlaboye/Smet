// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "./SmetERC1155.sol";

contract SmetERC1155Test is Test {
    SmetLoot loot;
    
    address owner = address(this);
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    
    function setUp() external {
        loot = new SmetLoot("https://api.smet.com/loot/");
    }
    
    function test_mint() external {
        loot.mint(alice, 1, 100);
        assertEq(loot.balanceOf(alice, 1), 100);
    }
    
    function test_mintMultipleTokens() external {
        loot.mint(alice, 1, 50);
        loot.mint(alice, 2, 75);
        loot.mint(bob, 1, 25);
        
        assertEq(loot.balanceOf(alice, 1), 50);
        assertEq(loot.balanceOf(alice, 2), 75);
        assertEq(loot.balanceOf(bob, 1), 25);
    }
    
    function test_safeTransferFrom() external {
        loot.mint(alice, 1, 100);
        
        vm.prank(alice);
        loot.safeTransferFrom(alice, bob, 1, 30, "");
        
        assertEq(loot.balanceOf(alice, 1), 70);
        assertEq(loot.balanceOf(bob, 1), 30);
    }
    
    function test_safeBatchTransferFrom() external {
        loot.mint(alice, 1, 100);
        loot.mint(alice, 2, 200);
        
        uint256[] memory ids = new uint256[](2);
        uint256[] memory amounts = new uint256[](2);
        ids[0] = 1;
        ids[1] = 2;
        amounts[0] = 30;
        amounts[1] = 50;
        
        vm.prank(alice);
        loot.safeBatchTransferFrom(alice, bob, ids, amounts, "");
        
        assertEq(loot.balanceOf(alice, 1), 70);
        assertEq(loot.balanceOf(alice, 2), 150);
        assertEq(loot.balanceOf(bob, 1), 30);
        assertEq(loot.balanceOf(bob, 2), 50);
    }
    
    function test_setApprovalForAll() external {
        vm.prank(alice);
        loot.setApprovalForAll(bob, true);
        
        assertTrue(loot.isApprovedForAll(alice, bob));
        
        loot.mint(alice, 1, 100);
        
        vm.prank(bob);
        loot.safeTransferFrom(alice, bob, 1, 50, "");
        
        assertEq(loot.balanceOf(bob, 1), 50);
    }
    
    function test_balanceOfBatch() external {
        loot.mint(alice, 1, 100);
        loot.mint(bob, 2, 200);
        
        address[] memory accounts = new address[](2);
        uint256[] memory ids = new uint256[](2);
        accounts[0] = alice;
        accounts[1] = bob;
        ids[0] = 1;
        ids[1] = 2;
        
        uint256[] memory balances = loot.balanceOfBatch(accounts, ids);
        
        assertEq(balances[0], 100);
        assertEq(balances[1], 200);
    }
    
    function test_uri() external {
        string memory tokenUri = loot.uri(77);
        assertEq(tokenUri, "https://api.smet.com/loot/77.json");
    }
    
    function test_setBaseURI() external {
        loot.setBaseURI("https://new-api.com/loot/");
        string memory tokenUri = loot.uri(77);
        assertEq(tokenUri, "https://new-api.com/loot/77.json");
    }
    
    function test_setBaseURIOnlyOwner() external {
        vm.prank(alice);
        vm.expectRevert();
        loot.setBaseURI("https://malicious.com/");
    }
    
    function test_transferInsufficientBalance_reverts() external {
        loot.mint(alice, 1, 50);
        
        vm.prank(alice);
        vm.expectRevert();
        loot.safeTransferFrom(alice, bob, 1, 100, "");
    }
    
    function test_transferUnauthorized_reverts() external {
        loot.mint(alice, 1, 100);
        
        vm.prank(bob);
        vm.expectRevert();
        loot.safeTransferFrom(alice, bob, 1, 50, "");
    }
    
    function test_batchTransferMismatchedArrays_reverts() external {
        loot.mint(alice, 1, 100);
        
        uint256[] memory ids = new uint256[](2);
        uint256[] memory amounts = new uint256[](1); // Mismatched length
        ids[0] = 1;
        ids[1] = 2;
        amounts[0] = 50;
        
        vm.prank(alice);
        vm.expectRevert();
        loot.safeBatchTransferFrom(alice, bob, ids, amounts, "");
    }
}