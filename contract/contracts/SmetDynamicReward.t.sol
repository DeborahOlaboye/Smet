// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "./SmetReward.sol";
import "./SmetERC1155.sol";
import "./SmetERC20.sol";
import "./SmetERC721.sol";

contract SmetDynamicRewardTest is Test {
    SmetGold gold;
    SmetHero hero;
    SmetLoot loot;
    SmetReward box;
    
    address owner = address(this);
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    
    event RewardAdded(uint256 indexed index, Reward reward, uint32 weight);
    event RewardRemoved(uint256 indexed index);
    event RewardUpdated(uint256 indexed index, Reward reward, uint32 weight);
    event WeightsUpdated();
    event FeeUpdated(uint256 newFee);
    
    function setUp() external {
        gold = new SmetGold();
        hero = new SmetHero("https://api.smet.com/heroes/");
        loot = new SmetLoot("https://api.smet.com/loot/");
        
        // Start with minimal setup
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
        
        gold.transfer(address(box), 10000 ether);
        hero.mint(address(box));
        loot.mint(address(box), 77, 100);
        
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }
    
    // ===== ADD REWARD TESTS =====
    
    function test_addReward() external {
        Reward memory newReward = Reward(2, address(hero), 1);
        
        vm.expectEmit(true, false, false, true);
        emit RewardAdded(1, newReward, 50);
        
        box.addReward(newReward, 50);
        
        assertEq(box.getRewardCount(), 2);
        Reward memory added = box.getReward(1);
        assertEq(added.assetType, 2);
        assertEq(added.token, address(hero));
        assertEq(added.idOrAmount, 1);
    }
    
    function test_addRewardOnlyOwner() external {
        Reward memory newReward = Reward(2, address(hero), 1);
        
        vm.prank(alice);
        vm.expectRevert();
        box.addReward(newReward, 50);
    }
    
    function test_addRewardInvalidWeight() external {
        Reward memory newReward = Reward(2, address(hero), 1);
        
        vm.expectRevert("!weight");
        box.addReward(newReward, 0);
    }
    
    function test_addRewardInvalidAssetType() external {
        Reward memory newReward = Reward(4, address(hero), 1);
        
        vm.expectRevert("invalid assetType");
        box.addReward(newReward, 50);
    }
    
    // ===== REMOVE REWARD TESTS =====
    
    function test_removeReward() external {
        // Add another reward first
        box.addReward(Reward(2, address(hero), 1), 50);
        assertEq(box.getRewardCount(), 2);
        
        vm.expectEmit(true, false, false, false);
        emit RewardRemoved(0);
        
        box.removeReward(0);
        
        assertEq(box.getRewardCount(), 1);
        Reward memory remaining = box.getReward(0);
        assertEq(remaining.assetType, 2);
    }
    
    function test_removeRewardOnlyOwner() external {
        vm.prank(alice);
        vm.expectRevert();
        box.removeReward(0);
    }
    
    function test_removeRewardInvalidIndex() external {
        vm.expectRevert("invalid index");
        box.removeReward(5);
    }
    
    function test_removeLastReward() external {
        box.removeReward(0);
        assertEq(box.getRewardCount(), 0);
    }
    
    // ===== UPDATE REWARD TESTS =====
    
    function test_updateReward() external {
        Reward memory updatedReward = Reward(3, address(loot), 88);
        
        vm.expectEmit(true, false, false, true);
        emit RewardUpdated(0, updatedReward, 75);
        
        box.updateReward(0, updatedReward, 75);
        
        Reward memory updated = box.getReward(0);
        assertEq(updated.assetType, 3);
        assertEq(updated.token, address(loot));
        assertEq(updated.idOrAmount, 88);
    }
    
    function test_updateRewardOnlyOwner() external {
        Reward memory updatedReward = Reward(3, address(loot), 88);
        
        vm.prank(alice);
        vm.expectRevert();
        box.updateReward(0, updatedReward, 75);
    }
    
    function test_updateRewardInvalidIndex() external {
        Reward memory updatedReward = Reward(3, address(loot), 88);
        
        vm.expectRevert("invalid index");
        box.updateReward(5, updatedReward, 75);
    }
    
    // ===== UPDATE WEIGHTS TESTS =====
    
    function test_updateWeights() external {
        box.addReward(Reward(2, address(hero), 1), 50);
        
        uint32[] memory newWeights = new uint32[](2);
        newWeights[0] = 80;
        newWeights[1] = 20;
        
        vm.expectEmit(false, false, false, false);
        emit WeightsUpdated();
        
        box.updateWeights(newWeights);
        
        uint32[] memory weights = box.getWeights();
        assertEq(weights[0], 80);
        assertEq(weights[1], 100); // Cumulative
    }
    
    function test_updateWeightsOnlyOwner() external {
        uint32[] memory newWeights = new uint32[](1);
        newWeights[0] = 100;
        
        vm.prank(alice);
        vm.expectRevert();
        box.updateWeights(newWeights);
    }
    
    function test_updateWeightsMismatch() external {
        uint32[] memory newWeights = new uint32[](2);
        newWeights[0] = 50;
        newWeights[1] = 50;
        
        vm.expectRevert("len mismatch");
        box.updateWeights(newWeights);
    }
    
    // ===== UPDATE FEE TESTS =====
    
    function test_updateFee() external {
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated(0.02 ether);
        
        box.updateFee(0.02 ether);
        assertEq(box.fee(), 0.02 ether);
    }
    
    function test_updateFeeOnlyOwner() external {
        vm.prank(alice);
        vm.expectRevert();
        box.updateFee(0.02 ether);
    }
    
    // ===== BATCH OPERATIONS TESTS =====
    
    function test_addRewardsBatch() external {
        Reward[] memory rewards = new Reward[](2);
        rewards[0] = Reward(2, address(hero), 1);
        rewards[1] = Reward(3, address(loot), 77);
        
        uint32[] memory weights = new uint32[](2);
        weights[0] = 30;
        weights[1] = 20;
        
        box.addRewardsBatch(rewards, weights);
        
        assertEq(box.getRewardCount(), 3);
        assertEq(box.getReward(1).assetType, 2);
        assertEq(box.getReward(2).assetType, 3);
    }
    
    function test_removeRewardsBatch() external {
        // Add more rewards first
        box.addReward(Reward(2, address(hero), 1), 30);
        box.addReward(Reward(3, address(loot), 77), 20);
        assertEq(box.getRewardCount(), 3);
        
        uint256[] memory indices = new uint256[](2);
        indices[0] = 0;
        indices[1] = 2;
        
        box.removeRewardsBatch(indices);
        
        assertEq(box.getRewardCount(), 1);
        assertEq(box.getReward(0).assetType, 2);
    }
    
    // ===== PAUSE FUNCTIONALITY TESTS =====
    
    function test_pauseUnpause() external {
        box.pause();
        
        vm.prank(alice);
        vm.expectRevert();
        box.open{value: 0.01 ether}(false);
        
        box.unpause();
        
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.01 ether}(false);
        assertTrue(reqId > 0);
    }
    
    function test_pauseOnlyOwner() external {
        vm.prank(alice);
        vm.expectRevert();
        box.pause();
    }
    
    // ===== EMERGENCY FUNCTIONS TESTS =====
    
    function test_emergencyWithdraw() external {
        uint256 ownerBalanceBefore = gold.balanceOf(owner);
        
        box.emergencyWithdraw(address(gold), 1000 ether);
        
        assertEq(gold.balanceOf(owner), ownerBalanceBefore + 1000 ether);
    }
    
    function test_emergencyWithdrawETH() external {
        vm.deal(address(box), 1 ether);
        uint256 ownerBalanceBefore = owner.balance;
        
        box.emergencyWithdraw(address(0), 0.5 ether);
        
        assertEq(owner.balance, ownerBalanceBefore + 0.5 ether);
    }
    
    function test_emergencyWithdrawNFT() external {
        box.emergencyWithdrawNFT(address(hero), 1);
        assertEq(hero.ownerOf(1), owner);
    }
    
    function test_emergencyWithdraw1155() external {
        box.emergencyWithdraw1155(address(loot), 77, 50);
        assertEq(loot.balanceOf(owner, 77), 50);
    }
    
    // ===== VIEW FUNCTIONS TESTS =====
    
    function test_getAllRewards() external {
        box.addReward(Reward(2, address(hero), 1), 30);
        
        Reward[] memory allRewards = box.getAllRewards();
        assertEq(allRewards.length, 2);
        assertEq(allRewards[0].assetType, 1);
        assertEq(allRewards[1].assetType, 2);
    }
    
    function test_getWeights() external {
        box.addReward(Reward(2, address(hero), 1), 30);
        
        uint32[] memory weights = box.getWeights();
        assertEq(weights.length, 2);
        assertEq(weights[0], 100);
        assertEq(weights[1], 130);
    }
    
    // ===== INTEGRATION TESTS =====
    
    function test_dynamicRewardDistribution() external {
        // Add new reward
        box.addReward(Reward(2, address(hero), 1), 100);
        
        // Update weights to favor hero
        uint32[] memory newWeights = new uint32[](2);
        newWeights[0] = 20;  // Gold less likely
        newWeights[1] = 80;  // Hero more likely
        box.updateWeights(newWeights);
        
        // Open box
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.01 ether}(false);
        
        // Fulfill with random that should select hero (75 > 20)
        uint256[] memory heroRandom = new uint256[](1);
        heroRandom[0] = 75;
        
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId, heroRandom);
        
        assertEq(hero.ownerOf(1), alice);
    }

    // ===== EDGE CASE TESTS =====

    function test_addRewardToEmptyPool() external {
        // Remove all rewards first
        box.removeReward(0);
        assertEq(box.getRewardCount(), 0);
        
        // Add reward to empty pool
        Reward memory newReward = Reward(1, address(gold), 500 ether);
        box.addReward(newReward, 100);
        
        assertEq(box.getRewardCount(), 1);
        uint32[] memory weights = box.getWeights();
        assertEq(weights[0], 100);
    }

    function test_updateWeightsZeroWeight() external {
        uint32[] memory newWeights = new uint32[](1);
        newWeights[0] = 0;
        
        vm.expectRevert("!weight");
        box.updateWeights(newWeights);
    }

    function test_batchOperationsEmptyArrays() external {
        Reward[] memory emptyRewards = new Reward[](0);
        uint32[] memory emptyWeights = new uint32[](0);
        
        vm.expectRevert("empty arrays");
        box.addRewardsBatch(emptyRewards, emptyWeights);
        
        uint256[] memory emptyIndices = new uint256[](0);
        vm.expectRevert("empty indices");
        box.removeRewardsBatch(emptyIndices);
    }

    function test_setRewardStock() external {
        box.setRewardStock(0, 2000 ether);
        
        Reward memory updated = box.getReward(0);
        assertEq(updated.idOrAmount, 2000 ether);
    }

    function test_setRewardStockNonERC20() external {
        box.addReward(Reward(2, address(hero), 1), 50);
        
        vm.expectRevert("only ERC20");
        box.setRewardStock(1, 5);
    }

    function test_getRewardStockETH() external {
        vm.deal(address(box), 5 ether);
        
        uint256 ethStock = box.getRewardStock(address(0), 0);
        assertEq(ethStock, 5 ether);
    }

    function test_getRewardStockERC20() external {
        uint256 goldStock = box.getRewardStock(address(gold), 0);
        assertEq(goldStock, 10000 ether);
    }

    function test_getRewardStockERC1155() external {
        uint256 lootStock = box.getRewardStock(address(loot), 77);
        assertEq(lootStock, 100);
    }

    function test_multipleWeightUpdates() external {
        box.addReward(Reward(2, address(hero), 1), 50);
        box.addReward(Reward(3, address(loot), 77), 25);
        
        // First update
        uint32[] memory weights1 = new uint32[](3);
        weights1[0] = 60;
        weights1[1] = 30;
        weights1[2] = 10;
        box.updateWeights(weights1);
        
        uint32[] memory cdf1 = box.getWeights();
        assertEq(cdf1[0], 60);
        assertEq(cdf1[1], 90);
        assertEq(cdf1[2], 100);
        
        // Second update
        uint32[] memory weights2 = new uint32[](3);
        weights2[0] = 20;
        weights2[1] = 30;
        weights2[2] = 50;
        box.updateWeights(weights2);
        
        uint32[] memory cdf2 = box.getWeights();
        assertEq(cdf2[0], 20);
        assertEq(cdf2[1], 50);
        assertEq(cdf2[2], 100);
    }
}