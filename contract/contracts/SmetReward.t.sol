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
}