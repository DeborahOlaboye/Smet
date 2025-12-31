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
        uint256 reqId = box.open{value: 0.05 ether}(true, 0);
        // reqId may vary depending on VRF coordinator; at minimum ensure payment was accepted
        assertEq(address(box).balance, 0.05 ether);
    }

    function test_fulfill() external {
        vm.prank(alice);
        box.open{value: 0.05 ether}(true, 0);

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
        emit Opened(alice, 0, 0);

        vm.prank(alice);
        box.open{value: 0.05 ether}(true, 0);

        Reward memory expected = Reward(2, address(hero), 1, 0);
        vm.expectEmit(true, false, false, false);
        emit RewardOut(alice, expected);

        box.fulfillRandomWords(FAKE_REQ_ID, fakeRandom);
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

        box.fulfillRandomWords(FAKE_REQ_ID, fakeRandom);

        // after fulfill, waiting mapping should be cleaned
        assertEq(box.waitingPoolOf(FAKE_REQ_ID), 0);

        // Expect ERC20 to be delivered from pool 1's selection
        assertEq(gold.balanceOf(alice), 777 ether);
    }
}