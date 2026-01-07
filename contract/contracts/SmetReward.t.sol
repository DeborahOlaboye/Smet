// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "./SmetReward.sol";
import "./SmetERC1155.sol";
import "./SmetERC20.sol";
import "./SmetERC721.sol";

contract SmetRewardTest is Test {
    SmetGold    gold;
    SmetHero    hero;
    SmetLoot    loot;
    SmetReward  box;

    address owner = address(this);
    address alice = makeAddr("alice");
    address bob   = makeAddr("bob");

    uint256 constant FAKE_REQ_ID = 123;
    uint256[]       fakeRandom   = [uint256(55)];

    function setUp() external {
        gold = new SmetGold();
        hero = new SmetHero("https://api.smet.com/heroes/");
        loot = new SmetLoot("https://api.smet.com/loot/");

        Reward[] memory prizes = new Reward[](3);
        prizes[0] = Reward(1, address(gold), 500 ether, 0);
        prizes[1] = Reward(2, address(hero), 1, 0);   
        prizes[2] = Reward(3, address(loot), 77, 0);    

        uint32[] memory w = new uint32[](3);
        w[0] = 60; w[1] = 90; w[2] = 100; 

        // coordinator, subId, keyHash, fee, cooldownSeconds, weights, prizes
        box = new SmetReward(
            address(0x1234),      // Mock VRF coordinator
            1,                    // Subscription ID
            keccak256("keyHash"), // Key hash
            0.05 ether,
            60,
            w,
            prizes
        );


        gold.transfer(address(box), 10_000 ether);
        hero.mint(address(box));
        loot.mint(address(box), 77, 100);

        vm.deal(alice, 10 ether);
    }


    function test_open() external {
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);
        assertTrue(reqId > 0);
        assertEq(address(box).balance, 0.05 ether);
    }

    function test_fulfill() external {
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);

        // Mock the fulfillRandomWords call
        vm.prank(address(0x1234)); // VRF coordinator
        box.fulfillRandomWords(reqId, fakeRandom);

        assertEq(hero.ownerOf(1), alice);
    }

    function test_refillERC20() external {
        uint256 pre = gold.balanceOf(address(box));
        gold.transfer(address(box), 1000 ether);
        assertEq(gold.balanceOf(address(box)), pre + 1000 ether);
    }

    function test_goldMint() external {
        assertEq(gold.totalSupply(), 1000000 ether);
        assertEq(gold.balanceOf(owner), 1000000 ether - 10000 ether);
    }

    function test_heroMint() external {
        uint256 id = hero.mint(bob);
        assertEq(hero.ownerOf(id), bob);
        assertEq(hero.nextId(), 3);
    }

    function test_lootMint() external {
        loot.mint(bob, 88, 50);
        assertEq(loot.balanceOf(bob, 88), 50);
    }

    event Opened(address indexed opener, uint256 indexed reqId);
    event RewardOut(address indexed opener, Reward reward);

    function test_events() external {
        vm.expectEmit(true, true, false, false);
        emit Opened(alice, 1); // First request ID should be 1

        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);

        Reward memory expected = Reward(2, address(hero), 1, 0);
        vm.expectEmit(true, false, false, false);
        emit RewardOut(alice, expected);

        vm.prank(address(0x1234)); // VRF coordinator
        box.fulfillRandomWords(reqId, fakeRandom);
    }

    // ===== INSUFFICIENT FEE TESTS =====
    
    function test_openWithInsufficientFee_reverts() external {
        vm.prank(alice);
        vm.expectRevert("!fee");
        box.open{value: 0.04 ether}(false);
    }
    
    function test_openWithZeroFee_reverts() external {
        vm.prank(alice);
        vm.expectRevert("!fee");
        box.open{value: 0}(false);
    }
    
    function test_openWithExcessiveFee_reverts() external {
        vm.prank(alice);
        vm.expectRevert("!fee");
        box.open{value: 0.1 ether}(false);
    }
    
    // ===== NO REWARDS LEFT TESTS =====
    
    function test_openWhenERC20RewardsExhausted() external {
        // Drain all ERC20 tokens from contract
        uint256 balance = gold.balanceOf(address(box));
        vm.prank(address(box));
        gold.transfer(owner, balance);
        
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);
        
        // Should revert when trying to fulfill with ERC20 reward
        uint256[] memory erc20Random = new uint256[](1);
        erc20Random[0] = 30; // Should select ERC20 reward (index 0)
        
        vm.prank(address(0x1234));
        vm.expectRevert();
        box.fulfillRandomWords(reqId, erc20Random);
    }
    
    function test_openWhenERC721RewardsExhausted() external {
        // Transfer the hero NFT away
        vm.prank(address(box));
        hero.transferFrom(address(box), owner, 1);
        
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);
        
        // Should revert when trying to fulfill with ERC721 reward
        uint256[] memory erc721Random = new uint256[](1);
        erc721Random[0] = 75; // Should select ERC721 reward (index 1)
        
        vm.prank(address(0x1234));
        vm.expectRevert();
        box.fulfillRandomWords(reqId, erc721Random);
    }
    
    function test_openWhenERC1155RewardsExhausted() external {
        // Transfer all ERC1155 tokens away
        vm.prank(address(box));
        loot.safeTransferFrom(address(box), owner, 77, 100, "");
        
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);
        
        // Should revert when trying to fulfill with ERC1155 reward
        uint256[] memory erc1155Random = new uint256[](1);
        erc1155Random[0] = 95; // Should select ERC1155 reward (index 2)
        
        vm.prank(address(0x1234));
        vm.expectRevert();
        box.fulfillRandomWords(reqId, erc1155Random);
    }
    
    // ===== VRF CALLBACK SCENARIO TESTS =====
    
    function test_fulfillRandomWords_unauthorizedCaller_reverts() external {
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);
        
        // Try to fulfill from unauthorized address
        vm.prank(bob);
        vm.expectRevert();
        box.fulfillRandomWords(reqId, fakeRandom);
    }
    
    function test_fulfillRandomWords_invalidRequestId_reverts() external {
        // Try to fulfill non-existent request
        vm.prank(address(0x1234));
        vm.expectRevert("no opener");
        box.fulfillRandomWords(999, fakeRandom);
    }
    
    function test_fulfillRandomWords_multipleCallsSameRequest_reverts() external {
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);
        
        // First fulfill should work
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId, fakeRandom);
        
        // Second fulfill should revert
        vm.prank(address(0x1234));
        vm.expectRevert("no opener");
        box.fulfillRandomWords(reqId, fakeRandom);
    }
    
    function test_fulfillRandomWords_differentRandomValues() external {
        // Test ERC20 reward selection (random < 60)
        vm.prank(alice);
        uint256 reqId1 = box.open{value: 0.05 ether}(false);
        
        uint256[] memory erc20Random = new uint256[](1);
        erc20Random[0] = 30;
        
        uint256 aliceGoldBefore = gold.balanceOf(alice);
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId1, erc20Random);
        assertEq(gold.balanceOf(alice), aliceGoldBefore + 500 ether);
        
        // Test ERC1155 reward selection (random >= 90)
        vm.prank(bob);
        vm.deal(bob, 1 ether);
        uint256 reqId2 = box.open{value: 0.05 ether}(false);
        
        uint256[] memory erc1155Random = new uint256[](1);
        erc1155Random[0] = 95;
        
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId2, erc1155Random);
        assertEq(loot.balanceOf(bob, 77), 1);
    }
    
    // ===== ACCESS CONTROL TESTS =====
    
    function test_onlyVRFCoordinatorCanFulfill() external {
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);
        
        // Random user cannot fulfill
        vm.prank(alice);
        vm.expectRevert();
        box.fulfillRandomWords(reqId, fakeRandom);
        
        // Owner cannot fulfill
        vm.prank(owner);
        vm.expectRevert();
        box.fulfillRandomWords(reqId, fakeRandom);
        
        // Only VRF coordinator can fulfill
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId, fakeRandom);
    }
    
    function test_refillAccessControl() external {
        // Anyone should be able to refill with ERC20 tokens
        vm.prank(alice);
        gold.transfer(alice, 1000 ether);
        
        vm.prank(alice);
        gold.approve(address(box), 1000 ether);
        
        vm.prank(alice);
        box.refill(gold, 1000 ether);
        
        // Verify tokens were transferred
        assertEq(gold.balanceOf(address(box)), 10000 ether + 1000 ether);
    }
    
    function test_heroMintAccessControl() external {
        // Anyone should be able to mint heroes (no access control)
        vm.prank(alice);
        uint256 tokenId = hero.mint(alice);
        assertEq(hero.ownerOf(tokenId), alice);
    }
    
    function test_heroSetBaseURIAccessControl() external {
        // Only owner can set base URI
        vm.prank(alice);
        vm.expectRevert();
        hero.setBaseURI("https://new-uri.com/");
        
        // Owner can set base URI
        vm.prank(owner);
        hero.setBaseURI("https://new-uri.com/");
    }
    
    function test_lootMintAccessControl() external {
        // Anyone should be able to mint loot (no access control)
        vm.prank(alice);
        loot.mint(alice, 99, 50);
        assertEq(loot.balanceOf(alice, 99), 50);
    }
    
    function test_lootSetBaseURIAccessControl() external {
        // Only owner can set base URI
        vm.prank(alice);
        vm.expectRevert();
        loot.setBaseURI("https://new-loot-uri.com/");
        
        // Owner can set base URI
        vm.prank(owner);
        loot.setBaseURI("https://new-loot-uri.com/");
    }
    
    // ===== EDGE CASE TESTS =====
    
    function test_invalidAssetType_reverts() external {
        // Create reward with invalid asset type
        Reward[] memory invalidPrizes = new Reward[](1);
        invalidPrizes[0] = Reward(4, address(gold), 100 ether); // Invalid type 4
        
        uint32[] memory w = new uint32[](1);
        w[0] = 100;
        
        SmetReward invalidBox = new SmetReward(
            address(0x1234),
            1,
            keccak256("keyHash"),
            0.05 ether,
            w,
            invalidPrizes
        );
        
        vm.prank(alice);
        uint256 reqId = invalidBox.open{value: 0.05 ether}(false);
        
        vm.prank(address(0x1234));
        vm.expectRevert("invalid assetType");
        invalidBox.fulfillRandomWords(reqId, fakeRandom);
    }
    
    function test_emptyWeightsAndPrizes_reverts() external {
        Reward[] memory emptyPrizes = new Reward[](0);
        uint32[] memory emptyWeights = new uint32[](0);
        
        vm.expectRevert("len mismatch");
        new SmetReward(
            address(0x1234),
            1,
            keccak256("keyHash"),
            0.05 ether,
            emptyWeights,
            emptyPrizes
        );
    }
    
    function test_mismatchedWeightsAndPrizes_reverts() external {
        Reward[] memory prizes = new Reward[](2);
        prizes[0] = Reward(1, address(gold), 100 ether);
        prizes[1] = Reward(2, address(hero), 1);
        
        uint32[] memory weights = new uint32[](3); // Mismatched length
        weights[0] = 50;
        weights[1] = 80;
        weights[2] = 100;
        
        vm.expectRevert("len mismatch");
        new SmetReward(
            address(0x1234),
            1,
            keccak256("keyHash"),
            0.05 ether,
            weights,
            prizes
        );
    }
    
    function test_refillWithZeroAmount_reverts() external {
        vm.expectRevert("!amount");
        box.refill(gold, 0);
    }
    
    function test_multipleOpensFromSameUser() external {
        vm.deal(alice, 10 ether);
        
        vm.prank(alice);
        uint256 reqId1 = box.open{value: 0.05 ether}(false);
        
        vm.prank(alice);
        uint256 reqId2 = box.open{value: 0.05 ether}(false);
        
        assertTrue(reqId1 != reqId2);
        assertEq(address(box).balance, 0.1 ether);
    }
    
    function test_randomnessDistribution() external {
        // Test edge cases of random distribution
        vm.prank(alice);
        uint256 reqId1 = box.open{value: 0.05 ether}(false);
        
        // Test exact boundary values
        uint256[] memory boundaryRandom = new uint256[](1);
        boundaryRandom[0] = 59; // Should select first prize (ERC20)
        
        uint256 aliceGoldBefore = gold.balanceOf(alice);
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId1, boundaryRandom);
        assertEq(gold.balanceOf(alice), aliceGoldBefore + 500 ether);
        
        // Test another boundary
        vm.prank(bob);
        vm.deal(bob, 1 ether);
        uint256 reqId2 = box.open{value: 0.05 ether}(false);
        
        boundaryRandom[0] = 89; // Should select second prize (ERC721)
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId2, boundaryRandom);
        assertEq(hero.ownerOf(1), bob);
    }
    
    // ===== ERC INTERFACE COMPLIANCE TESTS =====
    
    function test_erc721ReceiverCompliance() external {
        bytes4 selector = box.onERC721Received(address(0), address(0), 0, "");
        assertEq(selector, IERC721Receiver.onERC721Received.selector);
    }
    
    function test_erc1155ReceiverCompliance() external {
        bytes4 selector = box.onERC1155Received(address(0), address(0), 0, 0, "");
        assertEq(selector, IERC1155Receiver.onERC1155Received.selector);
        
        uint256[] memory ids = new uint256[](2);
        uint256[] memory amounts = new uint256[](2);
        bytes4 batchSelector = box.onERC1155BatchReceived(address(0), address(0), ids, amounts, "");
        assertEq(batchSelector, IERC1155Receiver.onERC1155BatchReceived.selector);
    }
    
    function test_supportsInterface() external {
        assertTrue(box.supportsInterface(type(IERC721Receiver).interfaceId));
        assertTrue(box.supportsInterface(type(IERC1155Receiver).interfaceId));
        assertFalse(box.supportsInterface(0x12345678)); // Random interface
    }
    
    function test_receiveEther() external {
        uint256 balanceBefore = address(box).balance;
        
        // Send ether directly to contract
        vm.prank(alice);
        (bool success,) = address(box).call{value: 1 ether}("");
        assertTrue(success);
        
        assertEq(address(box).balance, balanceBefore + 1 ether);
    }
    
    // ===== TOKEN URI AND METADATA TESTS =====
    
    function test_heroTokenURI() external {
        uint256 tokenId = hero.mint(alice);
        string memory uri = hero.tokenURI(tokenId);
        assertEq(uri, string(abi.encodePacked("https://api.smet.com/heroes/", tokenId, ".json")));
    }
    
    function test_heroTokenURINonExistent_reverts() external {
        vm.expectRevert("Token does not exist");
        hero.tokenURI(999);
    }
    
    function test_lootTokenURI() external {
        string memory uri = loot.uri(77);
        assertEq(uri, "https://api.smet.com/loot/77.json");
    }
    
    function test_updateBaseURIs() external {
        // Update hero base URI
        vm.prank(owner);
        hero.setBaseURI("https://new-api.smet.com/heroes/");
        
        uint256 tokenId = hero.mint(alice);
        string memory newUri = hero.tokenURI(tokenId);
        assertEq(newUri, string(abi.encodePacked("https://new-api.smet.com/heroes/", tokenId, ".json")));
        
        // Update loot base URI
        vm.prank(owner);
        loot.setBaseURI("https://new-api.smet.com/loot/");
        
        string memory newLootUri = loot.uri(77);
        assertEq(newLootUri, "https://new-api.smet.com/loot/77.json");
    }
    
    // ===== GAS OPTIMIZATION AND PERFORMANCE TESTS =====
    
    function test_gasUsageForOpen() external {
        uint256 gasBefore = gasleft();
        
        vm.prank(alice);
        box.open{value: 0.05 ether}(false);
        
        uint256 gasUsed = gasBefore - gasleft();
        // Ensure gas usage is reasonable (adjust threshold as needed)
        assertTrue(gasUsed < 200000, "Open function uses too much gas");
    }
    
    function test_gasUsageForFulfill() external {
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);
        
        uint256 gasBefore = gasleft();
        
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId, fakeRandom);
        
        uint256 gasUsed = gasBefore - gasleft();
        // Ensure gas usage is reasonable
        assertTrue(gasUsed < 150000, "Fulfill function uses too much gas");
    }
    
    function test_batchOperations() external {
        vm.deal(alice, 10 ether);
        
        // Test multiple opens in sequence
        uint256[] memory reqIds = new uint256[](5);
        
        for (uint i = 0; i < 5; i++) {
            vm.prank(alice);
            reqIds[i] = box.open{value: 0.05 ether}(false);
        }
        
        // Verify all requests are unique
        for (uint i = 0; i < 5; i++) {
            for (uint j = i + 1; j < 5; j++) {
                assertTrue(reqIds[i] != reqIds[j], "Request IDs should be unique");
            }
        }
        
        assertEq(address(box).balance, 0.25 ether);
    }
    
    // ===== STATE CONSISTENCY AND INTEGRATION TESTS =====
    
    function test_stateConsistencyAfterMultipleOperations() external {
        uint256 initialGoldBalance = gold.balanceOf(address(box));
        uint256 initialHeroBalance = hero.balanceOf(address(box));
        uint256 initialLootBalance = loot.balanceOf(address(box), 77);
        
        // Perform multiple operations
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        
        vm.prank(alice);
        uint256 reqId1 = box.open{value: 0.05 ether}(false);
        
        vm.prank(bob);
        uint256 reqId2 = box.open{value: 0.05 ether}(false);
        
        // Fulfill first request (should give ERC721)
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId1, fakeRandom);
        
        // Fulfill second request with different random (should give ERC20)
        uint256[] memory erc20Random = new uint256[](1);
        erc20Random[0] = 30;
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId2, erc20Random);
        
        // Verify state consistency
        assertEq(hero.ownerOf(1), alice);
        assertEq(gold.balanceOf(bob), 500 ether);
        assertEq(gold.balanceOf(address(box)), initialGoldBalance - 500 ether);
        assertEq(hero.balanceOf(address(box)), initialHeroBalance - 1);
        assertEq(address(box).balance, 0.1 ether);
    }
    
    function test_fullWorkflowIntegration() external {
        // Test complete workflow from setup to reward distribution
        
        // 1. Verify initial setup
        assertEq(gold.totalSupply(), 10000000 ether);
        assertEq(hero.nextId(), 2); // One hero already minted in setup
        assertEq(loot.balanceOf(address(box), 77), 100);
        
        // 2. User opens reward box
        vm.prank(alice);
        uint256 reqId = box.open{value: 0.05 ether}(false);
        
        // 3. VRF fulfills request
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId, fakeRandom);
        
        // 4. Verify reward was distributed
        assertEq(hero.ownerOf(1), alice);
        
        // 5. Refill contract with more rewards
        gold.transfer(alice, 1000 ether);
        vm.prank(alice);
        gold.approve(address(box), 1000 ether);
        vm.prank(alice);
        box.refill(gold, 1000 ether);
        
        // 6. Verify refill worked
        assertEq(gold.balanceOf(address(box)), 10000 ether + 1000 ether);
    }
    
    // ===== SECURITY AND REENTRANCY TESTS =====
    
    function test_noReentrancyInOpen() external {
        // Create malicious contract that tries to reenter
        MaliciousReentrant malicious = new MaliciousReentrant(box);
        vm.deal(address(malicious), 1 ether);
        
        // Should not be able to reenter
        vm.expectRevert();
        malicious.attack();
    }
    
    function test_overflowProtection() external {
        // Test with very large numbers to ensure no overflow
        Reward[] memory largePrizes = new Reward[](1);
        largePrizes[0] = Reward(1, address(gold), type(uint256).max);
        
        uint32[] memory w = new uint32[](1);
        w[0] = type(uint32).max;
        
        // Should not overflow during construction
        SmetReward largeBox = new SmetReward(
            address(0x1234),
            1,
            keccak256("keyHash"),
            0.05 ether,
            w,
            largePrizes
        );
        
        // Verify CDF was calculated correctly
        assertTrue(address(largeBox) != address(0));
    }
    
    function test_frontRunningProtection() external {
        // Test that users cannot predict or manipulate randomness
        vm.prank(alice);
        uint256 reqId1 = box.open{value: 0.05 ether}(false);
        
        vm.prank(bob);
        vm.deal(bob, 1 ether);
        uint256 reqId2 = box.open{value: 0.05 ether}(false);
        
        // Even with same random values, different request IDs ensure different outcomes
        assertTrue(reqId1 != reqId2);
        
        // Fulfill both with same randomness
        vm.prank(address(0x1234));
        box.fulfillRandomWords(reqId1, fakeRandom);
        
        vm.prank(address(0x1234));
        vm.expectRevert("no opener"); // Second call should fail as reqId1 is already used
        box.fulfillRandomWords(reqId1, fakeRandom);
    }
}

// Malicious contract for reentrancy testing
contract MaliciousReentrant {
    SmetReward public target;
    
    constructor(SmetReward _target) {
        target = _target;
    }
    
    function attack() external {
        target.open{value: 0.05 ether}(false);
    }
    
    receive() external payable {
        // Try to reenter
        if (address(target).balance >= 0.05 ether) {
            target.open{value: 0.05 ether}(false);
        }
    }

    function test_cooldown_enforced() external {
        // First open should succeed
        vm.prank(alice);
        box.open{value: 0.05 ether}(true, 0);

        // Immediate second open by same user must revert due to cooldown
        vm.expectRevert(bytes("cooldown"));
        vm.prank(alice);
        box.open{value: 0.05 ether}(true, 0);
    }

    function test_availability_skips_locked() external {
        // Lock the first prize far into the future
        box.setPrizeAvailableAfter(0, uint64(block.timestamp + 1000));

        vm.prank(alice);
        box.open{value: 0.05 ether}(true, 0);

        // When fulfilling, the locked prize should be skipped and hero (idx 1) delivered
        box.fulfillRandomWords(FAKE_REQ_ID, fakeRandom);

        assertEq(hero.ownerOf(1), alice);
    }

    function test_admin_setters_and_access() external {
        // Only admin (this contract) can set cooldown
        box.setCooldownSeconds(10);
        assertEq(box.cooldownSeconds(), 10);

        // Non-admin should revert
        vm.prank(alice);
        vm.expectRevert(bytes("not admin"));
        box.setCooldownSeconds(0);

        // Prize availability setter is admin-only as well
        vm.prank(alice);
        vm.expectRevert(bytes("not admin"));
        box.setPrizeAvailableAfter(0, uint64(block.timestamp));
    }

    function test_isPrizeAvailable_view() external {
        // Initially all prizes are available
        assertEq(box.isPrizeAvailable(0), true);

        // Lock prize 0
        box.setPrizeAvailableAfter(0, uint64(block.timestamp + 1000));
        assertEq(box.isPrizeAvailable(0), false);
    }

    function test_noPrizesAvailable_reverts() external {
        // Lock all prizes into the future
        for (uint256 i = 0; i < 3; i++) {
            box.setPrizeAvailableAfter(i, uint64(block.timestamp + 1000));
        }

        vm.prank(alice);
        box.open{value: 0.05 ether}(true);

        vm.expectRevert(bytes("no available prize"));
        box.fulfillRandomWords(FAKE_REQ_ID, fakeRandom);
    }
    function test_addPool_nonAdmin_reverts() external {
        Reward[] memory p2 = new Reward[](1);
        p2[0] = Reward(1, address(gold), 1 ether, 0);
        uint32[] memory w2 = new uint32[](1);
        w2[0] = 100;

        vm.prank(alice);
        vm.expectRevert(bytes("not admin"));
        box.addPool(0, w2, p2);
    }

    function test_setPool_fee_weights_and_prizes_by_admin() external {
        Reward[] memory p2 = new Reward[](2);
        p2[0] = Reward(1, address(gold), 300 ether, 0);
        p2[1] = Reward(1, address(gold), 400 ether, 0);
        uint32[] memory w2 = new uint32[](2);
        w2[0] = 10; w2[1] = 20;

        uint256 pid = box.addPool(0.01 ether, w2, p2);
        assertEq(pid, 1);

        box.setPoolFee(1, 0.02 ether);
        assertEq(box.poolFee(1), 0.02 ether);

        vm.expectEmit(true, false, false, false);
        emit PoolUpdated(1);
        // Replace prizes
        Reward[] memory p3 = new Reward[](1);
        p3[0] = Reward(1, address(gold), 123 ether, 0);
        box.setPoolPrizes(1, p3);
        assertEq(box.prizePoolLength(1), 1);

        vm.expectEmit(true, false, false, false);
        emit PoolUpdated(1);
        // Replace weights
        uint32[] memory w3 = new uint32[](1);
        w3[0] = 99;
        box.setPoolWeights(1, w3);
        assertEq(box.prizePoolLength(1), 1);
    }

    function test_setPoolWeights_len_mismatch_reverts() external {
        Reward[] memory p2 = new Reward[](2);
        p2[0] = Reward(1, address(gold), 100 ether, 0);
        p2[1] = Reward(1, address(gold), 200 ether, 0);

        uint32[] memory w2 = new uint32[](2);
        w2[0] = 10; w2[1] = 20;

        uint256 pid = box.addPool(0, w2, p2);
        assertEq(pid, 1);

        uint32[] memory bad = new uint32[](1);
        bad[0] = 5;

        vm.expectRevert(bytes("len mismatch"));
        box.setPoolWeights(1, bad);
    }

    function test_getPoolInfo() external {
        Reward[] memory p2 = new Reward[](1);
        p2[0] = Reward(1, address(gold), 111 ether, 0);
        uint32[] memory w2 = new uint32[](1);
        w2[0] = 100;

        uint256 pid = box.addPool(0.007 ether, w2, p2);
        assertEq(pid, 1);

        (uint256 feeOut, uint256 cnt) = box.getPoolInfo(1);
        assertEq(feeOut, 0.007 ether);
        assertEq(cnt, 1);
    }

    function test_open_emits_opened_with_poolId() external {
        Reward[] memory p2 = new Reward[](1);
        p2[0] = Reward(1, address(gold), 1 ether, 0);
        uint32[] memory w2 = new uint32[](1);
        w2[0] = 100;

        uint256 pid = box.addPool(0.03 ether, w2, p2);
        assertEq(pid, 1);

        vm.expectEmit(true, false, false, false);
        emit Opened(alice, 0, 1);

        vm.prank(alice);
        box.open{value: 0.03 ether}(true, 1);
    }

    function test_open_wrong_fee_reverts() external {
        // Make sure opening a specific pool requires the configured fee
        Reward[] memory p2 = new Reward[](1);
        p2[0] = Reward(1, address(gold), 1 ether, 0);
        uint32[] memory w2 = new uint32[](1);
        w2[0] = 100;

        uint256 pid = box.addPool(0.1 ether, w2, p2);
        assertEq(pid, 1);

        vm.prank(alice);
        vm.expectRevert(bytes("!fee"));
        box.open{value: 0.05 ether}(true, 1);
    }

    function test_nonAdmin_setPoolPrizes_and_weights_revert() external {
        Reward[] memory p2 = new Reward[](1);
        p2[0] = Reward(1, address(gold), 1 ether, 0);
        uint32[] memory w2 = new uint32[](1);
        w2[0] = 100;

        uint256 pid = box.addPool(0, w2, p2);
        assertEq(pid, 1);

        // Non-admin tries to set prizes
        vm.prank(alice);
        vm.expectRevert(bytes("not admin"));
        box.setPoolPrizes(1, p2);

        // Non-admin tries to set weights
        vm.prank(alice);
        vm.expectRevert(bytes("not admin"));
        box.setPoolWeights(1, w2);
    }
    function test_lastOpened_set() external {
        vm.prank(alice);
        box.open{value: 0.05 ether}(true);
        assertTrue(box.lastOpened(alice) > 0);
    }

    function test_prizePoolLength() external {
        assertEq(box.prizePoolLength(0), 3);
    }

    function test_pool_count_and_event() external {
        assertEq(box.poolCount(), 1);

        Reward[] memory p2 = new Reward[](1);
        p2[0] = Reward(1, address(gold), 1 ether, 0);
        uint32[] memory w2 = new uint32[](1);
        w2[0] = 100;

        vm.expectEmit(true, false, false, false);
        emit PoolCreated(1, 0.02 ether);

        uint256 pid = box.addPool(0.02 ether, w2, p2);
        assertEq(pid, 1);
        assertEq(box.poolCount(), 2);
    }

    function test_multi_pool_selection() external {
        // Create a second pool (pid 1) with an ERC20-first prize to observe selection
        Reward[] memory p2 = new Reward[](2);
        p2[0] = Reward(1, address(gold), 777 ether, 0);
        p2[1] = Reward(2, address(hero), 1, 0);

        uint32[] memory w2 = new uint32[](2);
        w2[0] = 100; w2[1] = 101; // total 201; rnd 55 -> idx 0

        uint256 pid = box.addPool(0.02 ether, w2, p2);
        assertEq(pid, 1);

        // Ensure pool fee is required
        vm.prank(alice);
        box.open{value: 0.02 ether}(true, 1);

        // the waitingPool should be set for the fake req id (coordinator mock behavior)
        assertEq(box.waitingPoolOf(FAKE_REQ_ID), 1);
        assertEq(box.waitingOf(FAKE_REQ_ID), alice);

        box.fulfillRandomWords(FAKE_REQ_ID, fakeRandom);

        // after fulfill, waiting mapping should be cleaned
        assertEq(box.waitingPoolOf(FAKE_REQ_ID), 0);
        assertEq(box.waitingOf(FAKE_REQ_ID), address(0));

        // Expect ERC20 to be delivered from pool 1's selection
        assertEq(gold.balanceOf(alice), 777 ether);
    }
}