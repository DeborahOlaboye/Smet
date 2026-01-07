// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "./SmetERC721.sol";

contract SmetERC721Test is Test {
    SmetHero hero;
    
    address owner = address(this);
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    
    function setUp() external {
        hero = new SmetHero("https://api.smet.com/heroes/");
    }
    
    function test_mint() external {
        uint256 tokenId = hero.mint(alice);
        assertEq(tokenId, 1);
        assertEq(hero.ownerOf(tokenId), alice);
        assertEq(hero.balanceOf(alice), 1);
        assertEq(hero.nextId(), 2);
    }
    
    function test_multipleMints() external {
        uint256 tokenId1 = hero.mint(alice);
        uint256 tokenId2 = hero.mint(bob);
        uint256 tokenId3 = hero.mint(alice);
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(tokenId3, 3);
        assertEq(hero.balanceOf(alice), 2);
        assertEq(hero.balanceOf(bob), 1);
    }
    
    function test_transfer() external {
        uint256 tokenId = hero.mint(alice);
        
        vm.prank(alice);
        hero.transferFrom(alice, bob, tokenId);
        
        assertEq(hero.ownerOf(tokenId), bob);
        assertEq(hero.balanceOf(alice), 0);
        assertEq(hero.balanceOf(bob), 1);
    }
    
    function test_approve() external {
        uint256 tokenId = hero.mint(alice);
        
        vm.prank(alice);
        hero.approve(bob, tokenId);
        
        assertEq(hero.getApproved(tokenId), bob);
    }
    
    function test_transferFromApproved() external {
        uint256 tokenId = hero.mint(alice);
        
        vm.prank(alice);
        hero.approve(bob, tokenId);
        
        vm.prank(bob);
        hero.transferFrom(alice, bob, tokenId);
        
        assertEq(hero.ownerOf(tokenId), bob);
    }
    
    function test_setApprovalForAll() external {
        vm.prank(alice);
        hero.setApprovalForAll(bob, true);
        
        assertTrue(hero.isApprovedForAll(alice, bob));
    }
    
    function test_tokenURI() external {
        uint256 tokenId = hero.mint(alice);
        string memory uri = hero.tokenURI(tokenId);
        assertEq(uri, "https://api.smet.com/heroes/1.json");
    }
    
    function test_setBaseURI() external {
        hero.setBaseURI("https://new-api.com/");
        uint256 tokenId = hero.mint(alice);
        string memory uri = hero.tokenURI(tokenId);
        assertEq(uri, "https://new-api.com/1.json");
    }
    
    function test_setBaseURIOnlyOwner() external {
        vm.prank(alice);
        vm.expectRevert();
        hero.setBaseURI("https://malicious.com/");
    }
    
    function test_tokenURINonExistent_reverts() external {
        vm.expectRevert("Token does not exist");
        hero.tokenURI(999);
    }
    
    function test_transferUnauthorized_reverts() external {
        uint256 tokenId = hero.mint(alice);
        
        vm.prank(bob);
        vm.expectRevert();
        hero.transferFrom(alice, bob, tokenId);
    }
}