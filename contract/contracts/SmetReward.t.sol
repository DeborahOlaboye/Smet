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
        prizes[0] = Reward(1, address(gold), 500 ether);
        prizes[1] = Reward(2, address(hero), 1);   
        prizes[2] = Reward(3, address(loot), 77);    

        uint32[] memory w = new uint32[](3);
        w[0] = 60; w[1] = 90; w[2] = 100; 

        box = new SmetReward(
            address(0x1234),      // Mock VRF coordinator
            1,                    // Subscription ID
            keccak256("keyHash"), // Key hash
            0.05 ether,
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

        Reward memory expected = Reward(2, address(hero), 1);
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
}