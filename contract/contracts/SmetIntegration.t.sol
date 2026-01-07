// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "./SmetReward.sol";
import "./SmetERC1155.sol";
import "./SmetERC20.sol";
import "./SmetERC721.sol";

contract SmetIntegrationTest is Test {
    SmetGold gold;
    SmetHero hero;
    SmetLoot loot;
    SmetReward box;
    
    address owner = address(this);
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address charlie = makeAddr("charlie");
    
    event Opened(address indexed opener, uint256 indexed reqId);
    event RewardOut(address indexed opener, Reward reward);
    
    function setUp() external {
        // Deploy all contracts
        gold = new SmetGold();
        hero = new SmetHero("https://api.smet.com/heroes/");
        loot = new SmetLoot("https://api.smet.com/loot/");
        
        // Setup reward pool
        Reward[] memory prizes = new Reward[](5);
        prizes[0] = Reward(1, address(gold), 100 ether);   // Common
        prizes[1] = Reward(1, address(gold), 500 ether);   // Uncommon
        prizes[2] = Reward(2, address(hero), 1);           // Rare
        prizes[3] = Reward(3, address(loot), 77);          // Epic
        prizes[4] = Reward(3, address(loot), 88);          // Legendary
        
        uint32[] memory weights = new uint32[](5);
        weights[0] = 40;  // 40% chance
        weights[1] = 70;  // 30% chance
        weights[2] = 85;  // 15% chance
        weights[3] = 95;  // 10% chance
        weights[4] = 100; // 5% chance
        
        box = new SmetReward(
            address(0x1234), // Mock VRF coordinator
            1,
            keccak256("keyHash"),
            0.01 ether, // Lower fee for testing
            weights,
            prizes
        );
        
        // Fund contracts with rewards
        gold.transfer(address(box), 50000 ether);
        
        // Mint NFTs to reward contract
        for (uint i = 0; i < 10; i++) {
            hero.mint(address(box));
        }
        
        loot.mint(address(box), 77, 100);
        loot.mint(address(box), 88, 50);
        
        // Give users some ETH
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);
    }
    
    function test_completeGameplayWorkflow() external {
        // === PHASE 1: Initial State Verification ===
        assertEq(gold.totalSupply(), 10000000 ether);
        assertEq(gold.balanceOf(address(box)), 50000 ether);
        assertEq(hero.balanceOf(address(box)), 10);
        assertEq(loot.balanceOf(address(box), 77), 100);
        assertEq(loot.balanceOf(address(box), 88), 50);
        
        // === PHASE 2: Multiple Users Opening Boxes ===
        
        // Alice opens 3 boxes
        vm.startPrank(alice);
        uint256 reqId1 = box.open{value: 0.01 ether}(false);
        uint256 reqId2 = box.open{value: 0.01 ether}(false);
        uint256 reqId3 = box.open{value: 0.01 ether}(false);
        vm.stopPrank();
        
        // Bob opens 2 boxes
        vm.startPrank(bob);
        uint256 reqId4 = box.open{value: 0.01 ether}(false);
        uint256 reqId5 = box.open{value: 0.01 ether}(false);
        vm.stopPrank();
        
        // Charlie opens 1 box
        vm.prank(charlie);
        uint256 reqId6 = box.open{value: 0.01 ether}(false);
        
        // Verify contract received fees
        assertEq(address(box).balance, 0.06 ether);
        
        // === PHASE 3: VRF Fulfillment with Different Outcomes ===
        
        // Alice gets common gold (random = 20)
        uint256[] memory commonRandom = new uint256[](1);
        commonRandom[0] = 20;
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId1, commonRandom);
        assertEq(gold.balanceOf(alice), 100 ether);
        
        // Alice gets uncommon gold (random = 55)
        uint256[] memory uncommonRandom = new uint256[](1);
        uncommonRandom[0] = 55;
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId2, uncommonRandom);
        assertEq(gold.balanceOf(alice), 600 ether);
        
        // Alice gets rare hero (random = 80)
        uint256[] memory rareRandom = new uint256[](1);
        rareRandom[0] = 80;
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId3, rareRandom);
        assertEq(hero.balanceOf(alice), 1);
        assertEq(hero.ownerOf(1), alice);
        
        // Bob gets epic loot (random = 90)
        uint256[] memory epicRandom = new uint256[](1);
        epicRandom[0] = 90;
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId4, epicRandom);
        assertEq(loot.balanceOf(bob, 77), 1);
        
        // Bob gets legendary loot (random = 98)
        uint256[] memory legendaryRandom = new uint256[](1);
        legendaryRandom[0] = 98;
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId5, legendaryRandom);
        assertEq(loot.balanceOf(bob, 88), 1);
        
        // Charlie gets common gold (random = 35)
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId6, commonRandom);
        assertEq(gold.balanceOf(charlie), 100 ether);
        
        // === PHASE 4: Secondary Market Trading ===
        
        // Alice trades her hero to Bob for gold
        vm.prank(alice);
        gold.transfer(bob, 200 ether);
        
        vm.prank(alice);
        hero.approve(bob, 1);
        
        vm.prank(bob);
        hero.transferFrom(alice, bob, 1);
        
        vm.prank(bob);
        gold.transfer(alice, 1000 ether);
        
        // Verify trades
        assertEq(hero.ownerOf(1), bob);
        assertEq(gold.balanceOf(alice), 1400 ether); // 600 - 200 + 1000
        assertEq(gold.balanceOf(bob), 1000 ether - 200); // Initial 0 + 1000 - 200
        
        // === PHASE 5: Contract Refilling ===
        
        // Owner refills contract with more gold
        vm.prank(owner);
        gold.approve(address(box), 10000 ether);
        
        vm.prank(owner);
        box.refill(gold, 10000 ether);
        
        // Verify refill
        assertEq(gold.balanceOf(address(box)), 50000 ether - 700 ether + 10000 ether);
        
        // === PHASE 6: Batch Operations Test ===
        
        // Multiple users open boxes simultaneously
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        
        uint256[] memory batchReqIds = new uint256[](4);
        
        vm.prank(alice);
        batchReqIds[0] = box.open{value: 0.01 ether}(false);
        
        vm.prank(bob);
        batchReqIds[1] = box.open{value: 0.01 ether}(false);
        
        vm.prank(alice);
        batchReqIds[2] = box.open{value: 0.01 ether}(false);
        
        vm.prank(bob);
        batchReqIds[3] = box.open{value: 0.01 ether}(false);
        
        // Fulfill all batch requests
        for (uint i = 0; i < 4; i++) {
            vm.prank(address(0x1234));
            box.fulfillRandomWords(batchReqIds[i], commonRandom);
        }
        
        // === PHASE 7: Final State Verification ===
        
        // Verify total rewards distributed
        uint256 totalGoldDistributed = gold.balanceOf(alice) + gold.balanceOf(bob) + gold.balanceOf(charlie);
        assertTrue(totalGoldDistributed > 0);
        
        // Verify NFTs distributed
        assertTrue(hero.balanceOf(alice) + hero.balanceOf(bob) > 0);
        assertTrue(loot.balanceOf(alice, 77) + loot.balanceOf(bob, 77) > 0);
        assertTrue(loot.balanceOf(alice, 88) + loot.balanceOf(bob, 88) > 0);
        
        // Verify contract still has rewards for future use
        assertTrue(gold.balanceOf(address(box)) > 0);
        assertTrue(hero.balanceOf(address(box)) > 0);
        
        // Verify fee collection
        assertTrue(address(box).balance > 0);
    }
    
    function test_stressTestMultipleUsers() external {
        // Create 10 users and have them all open boxes
        address[] memory users = new address[](10);
        for (uint i = 0; i < 10; i++) {
            users[i] = makeAddr(string(abi.encodePacked("user", i)));
            vm.deal(users[i], 1 ether);
        }
        
        uint256[] memory reqIds = new uint256[](10);
        
        // All users open boxes
        for (uint i = 0; i < 10; i++) {
            vm.prank(users[i]);
            reqIds[i] = box.open{value: 0.01 ether}(false);
        }
        
        // Fulfill all requests with different random values
        for (uint i = 0; i < 10; i++) {
            uint256[] memory randomValue = new uint256[](1);
            randomValue[0] = (i * 13 + 7) % 100; // Pseudo-random distribution
            
            vm.prank(address(0x1234));
            box.fulfillRandomWords(reqIds[i], randomValue);
        }
        
        // Verify all users received some reward
        uint256 totalRewardsDistributed = 0;
        for (uint i = 0; i < 10; i++) {
            uint256 userGold = gold.balanceOf(users[i]);
            uint256 userHeroes = hero.balanceOf(users[i]);
            uint256 userLoot77 = loot.balanceOf(users[i], 77);
            uint256 userLoot88 = loot.balanceOf(users[i], 88);
            
            // Each user should have received exactly one reward
            uint256 userTotalRewards = (userGold > 0 ? 1 : 0) + userHeroes + userLoot77 + userLoot88;
            assertEq(userTotalRewards, 1, "Each user should receive exactly one reward");
            
            if (userGold > 0) totalRewardsDistributed++;
            if (userHeroes > 0) totalRewardsDistributed++;
            if (userLoot77 > 0) totalRewardsDistributed++;
            if (userLoot88 > 0) totalRewardsDistributed++;
        }
        
        assertEq(totalRewardsDistributed, 10, "Total rewards should equal number of users");
        assertEq(address(box).balance, 0.1 ether, "Contract should have collected all fees");
    }
}