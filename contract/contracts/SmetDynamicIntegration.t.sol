// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "./SmetReward.sol";
import "./SmetERC1155.sol";
import "./SmetERC20.sol";
import "./SmetERC721.sol";

contract SmetDynamicIntegrationTest is Test {
    SmetGold gold;
    SmetHero hero;
    SmetLoot loot;
    SmetReward box;
    
    address owner = address(this);
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address charlie = makeAddr("charlie");
    
    function setUp() external {
        gold = new SmetGold();
        hero = new SmetHero("https://api.smet.com/heroes/");
        loot = new SmetLoot("https://api.smet.com/loot/");
        
        // Start with single reward
        Reward[] memory prizes = new Reward[](1);
        prizes[0] = Reward(1, address(gold), 100 ether);
        
        uint32[] memory weights = new uint32[](1);
        weights[0] = 100;
        
        box = new SmetReward(
            address(0x1234),
            1,
            keccak256("keyHash"),
            0.01 ether,
            weights,
            prizes
        );
        
        // Fund contracts
        gold.transfer(address(box), 50000 ether);
        for (uint i = 0; i < 10; i++) {
            hero.mint(address(box));
        }
        loot.mint(address(box), 77, 100);
        loot.mint(address(box), 88, 50);
        
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);
    }
    
    function test_completeRewardManagementWorkflow() external {
        // === PHASE 1: Initial State ===
        assertEq(box.getRewardCount(), 1);
        assertEq(box.fee(), 0.01 ether);
        
        // === PHASE 2: Expand Reward Pool ===
        
        // Add hero rewards
        box.addReward(Reward(2, address(hero), 1), 30);
        box.addReward(Reward(2, address(hero), 2), 20);
        
        // Add loot rewards
        box.addReward(Reward(3, address(loot), 77), 15);
        box.addReward(Reward(3, address(loot), 88), 5);
        
        assertEq(box.getRewardCount(), 5);
        
        // === PHASE 3: Optimize Weights ===
        
        uint32[] memory optimizedWeights = new uint32[](5);
        optimizedWeights[0] = 50; // Common gold
        optimizedWeights[1] = 25; // Uncommon hero
        optimizedWeights[2] = 15; // Rare hero
        optimizedWeights[3] = 8;  // Epic loot
        optimizedWeights[4] = 2;  // Legendary loot
        
        box.updateWeights(optimizedWeights);
        
        uint32[] memory cdf = box.getWeights();
        assertEq(cdf[0], 50);
        assertEq(cdf[1], 75);
        assertEq(cdf[2], 90);
        assertEq(cdf[3], 98);
        assertEq(cdf[4], 100);
        
        // === PHASE 4: Test Distribution ===
        
        // Alice gets common reward (random = 25)
        vm.prank(alice);
        uint256 reqId1 = box.open{value: 0.01 ether}(false);
        
        uint256[] memory commonRandom = new uint256[](1);
        commonRandom[0] = 25;
        
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId1, commonRandom);
        assertEq(gold.balanceOf(alice), 100 ether);
        
        // Bob gets rare reward (random = 85)
        vm.prank(bob);
        uint256 reqId2 = box.open{value: 0.01 ether}(false);
        
        uint256[] memory rareRandom = new uint256[](1);
        rareRandom[0] = 85;
        
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId2, rareRandom);
        assertEq(hero.ownerOf(2), bob);
        
        // Charlie gets legendary reward (random = 99)
        vm.prank(charlie);
        uint256 reqId3 = box.open{value: 0.01 ether}(false);
        
        uint256[] memory legendaryRandom = new uint256[](1);
        legendaryRandom[0] = 99;
        
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId3, legendaryRandom);
        assertEq(loot.balanceOf(charlie, 88), 1);
        
        // === PHASE 5: Dynamic Adjustments ===
        
        // Remove underperforming reward
        box.removeReward(4); // Remove legendary loot
        assertEq(box.getRewardCount(), 4);
        
        // Add new seasonal reward
        box.addReward(Reward(1, address(gold), 1000 ether), 10);
        
        // Update weights for new distribution
        uint32[] memory newWeights = new uint32[](5);
        newWeights[0] = 40; // Reduced common
        newWeights[1] = 25; // Same uncommon
        newWeights[2] = 15; // Same rare
        newWeights[3] = 10; // Increased epic
        newWeights[4] = 10; // New seasonal
        
        box.updateWeights(newWeights);
        
        // === PHASE 6: Batch Operations ===
        
        // Add multiple rewards at once
        Reward[] memory batchRewards = new Reward[](2);
        batchRewards[0] = Reward(2, address(hero), 3);
        batchRewards[1] = Reward(2, address(hero), 4);
        
        uint32[] memory batchWeights = new uint32[](2);
        batchWeights[0] = 8;
        batchWeights[1] = 5;
        
        box.addRewardsBatch(batchRewards, batchWeights);
        assertEq(box.getRewardCount(), 7);
        
        // === PHASE 7: Emergency Management ===
        
        // Pause during maintenance
        box.pause();
        
        vm.prank(alice);
        vm.expectRevert();
        box.open{value: 0.01 ether}(false);
        
        // Update fee during pause
        box.updateFee(0.02 ether);
        assertEq(box.fee(), 0.02 ether);
        
        // Resume operations
        box.unpause();
        
        vm.prank(alice);
        uint256 reqId4 = box.open{value: 0.02 ether}(false);
        assertTrue(reqId4 > 0);
        
        // === PHASE 8: Stock Management ===
        
        // Check current stock levels
        uint256 goldStock = box.getRewardStock(address(gold), 0);
        uint256 lootStock = box.getRewardStock(address(loot), 77);
        
        assertTrue(goldStock > 0);
        assertTrue(lootStock > 0);
        
        // Update ERC20 reward stock
        box.setRewardStock(0, 200 ether);
        Reward memory updatedReward = box.getReward(0);
        assertEq(updatedReward.idOrAmount, 200 ether);
        
        // === PHASE 9: Final Validation ===
        
        // Verify final state
        assertEq(box.getRewardCount(), 7);
        assertEq(box.fee(), 0.02 ether);
        assertFalse(box.paused());
        
        // Verify all rewards are properly configured
        Reward[] memory allRewards = box.getAllRewards();
        assertEq(allRewards.length, 7);
        
        // Verify weights sum correctly
        uint32[] memory finalWeights = box.getWeights();
        assertTrue(finalWeights[finalWeights.length - 1] > 0);
        
        // Test final distribution works
        vm.prank(bob);
        uint256 finalReqId = box.open{value: 0.02 ether}(false);
        
        vm.prank(address(0x1234));
        box.fulfillRandomWords(finalReqId, commonRandom);
        
        // Verify contract collected fees
        assertEq(address(box).balance, 0.07 ether); // 4 opens * varying fees
    }
    
    function test_emergencyRecoveryWorkflow() external {
        // Simulate emergency scenario
        box.addReward(Reward(2, address(hero), 1), 50);
        
        // Emergency pause
        box.pause();
        
        // Emergency withdraw tokens
        uint256 ownerGoldBefore = gold.balanceOf(owner);
        box.emergencyWithdraw(address(gold), 1000 ether);
        assertEq(gold.balanceOf(owner), ownerGoldBefore + 1000 ether);
        
        // Emergency withdraw NFT
        box.emergencyWithdrawNFT(address(hero), 1);
        assertEq(hero.ownerOf(1), owner);
        
        // Emergency withdraw 1155
        box.emergencyWithdraw1155(address(loot), 77, 50);
        assertEq(loot.balanceOf(owner, 77), 50);
        
        // Resume after emergency
        box.unpause();
        
        // Verify contract still functional
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.01 ether}(false);
        assertTrue(reqId > 0);
    }
}