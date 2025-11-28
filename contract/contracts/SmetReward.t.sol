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
        prizes[0] = Reward(1, address(gold), 500 ether);
        prizes[1] = Reward(2, address(hero), 1);   
        prizes[2] = Reward(3, address(loot), 77);    

        uint32[] memory w = new uint32[](3);
        w[0] = 60; w[1] = 90; w[2] = 100; 

        box = new SmetReward(
            0,                    
            keccak256("keyHash"),   
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
        uint256 reqId = box.open{value: 0.05 ether}();
        assertEq(reqId, 0);
        assertEq(address(box).balance, 0.05 ether);
    }

    function test_fulfill() external {
        vm.prank(alice);
        box.open{value: 0.05 ether}();

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
        vm.expectEmit(true, true, false, false);
        emit Opened(alice, 0);

        vm.prank(alice);
        box.open{value: 0.05 ether}();

        Reward memory expected = Reward(2, address(hero), 1);
        vm.expectEmit(true, false, false, false);
        emit RewardOut(alice, expected);

        box.fulfillRandomWords(FAKE_REQ_ID, fakeRandom);
    }
}