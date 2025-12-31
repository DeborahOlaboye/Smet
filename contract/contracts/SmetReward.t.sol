// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./SmetReward.sol";
import "./SmetERC1155.sol";
import "./SmetERC20.sol";
import "./SmetERC721.sol";

contract SmetRewardTest is Test {
    SmetGold    gold;
    SmetHero    hero;
    SmetLoot    loot;
    SmetCapsule box;

    address owner = address(this);
    address alice = makeAddr("alice");
    address bob   = makeAddr("bob");

    uint256 constant FAKE_REQ_ID = 123;
    uint256[]       fakeRandom   = [uint256(55)];

    function setUp() external {
        gold = new SmetGold();
        hero = new SmetHero();
        loot = new SmetLoot();

        Reward[] memory prizes = new Reward[](3);
        prizes[0] = Reward(1, address(gold), 500 ether, 0);
        prizes[1] = Reward(2, address(hero), 1, 0);   
        prizes[2] = Reward(3, address(loot), 77, 0);    

        uint32[] memory w = new uint32[](3);
        w[0] = 60; w[1] = 90; w[2] = 100; 

        // coordinator, subId, keyHash, fee, cooldownSeconds, weights, prizes
        box = new SmetReward(
            address(0),
            0,
            keccak256("keyHash"),
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
        uint256 reqId = box.open{value: 0.05 ether}(true);
        // reqId may vary depending on VRF coordinator; at minimum ensure payment was accepted
        assertEq(address(box).balance, 0.05 ether);
    }

    function test_fulfill() external {
        vm.prank(alice);
        box.open{value: 0.05 ether}(true);

        box.fulfillRandomWords(FAKE_REQ_ID, fakeRandom);

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
        // Only check the opener index (ignore reqId which may vary)
        vm.expectEmit(true, false, false, false);
        emit Opened(alice, 0);

        vm.prank(alice);
        box.open{value: 0.05 ether}(true);

        Reward memory expected = Reward(2, address(hero), 1, 0);
        vm.expectEmit(true, false, false, false);
        emit RewardOut(alice, expected);

        box.fulfillRandomWords(FAKE_REQ_ID, fakeRandom);
    }

    function test_cooldown_enforced() external {
        // First open should succeed
        vm.prank(alice);
        box.open{value: 0.05 ether}(true);

        // Immediate second open by same user must revert due to cooldown
        vm.expectRevert(bytes("cooldown"));
        vm.prank(alice);
        box.open{value: 0.05 ether}(true);
    }

    function test_availability_skips_locked() external {
        // Lock the first prize far into the future
        box.setPrizeAvailableAfter(0, uint64(block.timestamp + 1000));

        vm.prank(alice);
        box.open{value: 0.05 ether}(true);

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

    function test_lastOpened_set() external {
        vm.prank(alice);
        box.open{value: 0.05 ether}(true);
        assertTrue(box.lastOpened(alice) > 0);
    }
}