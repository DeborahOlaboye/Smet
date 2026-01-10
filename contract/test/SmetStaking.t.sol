// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "../contracts/SmetStaking.sol";
import "../contracts/SmetERC20.sol";

contract SmetStakingTest is Test {
    SmetGold public gold;
    SmetStaking public staking;

    function setUp() public {
        gold = new SmetGold();
        // Use the same token for staking and rewards for simplicity
        staking = new SmetStaking(IERC20(address(gold)), IERC20(address(gold)), 7 days);

        // Fund staking contract with reward tokens
        gold.transfer(address(staking), 1000 ether);
    }

    function test_stake_and_reward_accrual() public {
        // Owner not required to call notifyRewardAmount (owner is msg.sender in constructor?)
        // Make owner the test contract
        deal(address(gold), address(this), 0); // no-op but ensure setup

        // Notify reward amount as owner
        vm.prank(staking.owner());
        // Since owner is the deployer (this address), but in test contract owner is address(this)
        // For safety, use the deployer (address(this)) to call notifyRewardAmount
        staking.notifyRewardAmount(700 ether);

        // Stake 100 tokens from user
        vm.prank(address(1));
        gold.transfer(address(1), 200 ether);
        vm.prank(address(1));
        gold.approve(address(staking), 200 ether);
        vm.prank(address(1));
        staking.stake(100 ether);

        // Warp forward 1 day
        vm.warp(block.timestamp + 1 days);

        // Claim rewards
        vm.prank(address(1));
        staking.claimReward();

        // Expect some reward (not precise equal due to time and rate math but > 0)
        uint256 earned = staking.earned(address(1));
        assertEq(staking.balanceOf(address(1)), 100 ether);
        assertGt(earned + 0, 0);
    }

    function test_multiple_stakers_proportional() public {
        vm.prank(address(2));
        gold.transfer(address(2), 300 ether);
        vm.prank(address(2));
        gold.approve(address(staking), 300 ether);
        vm.prank(address(3));
        gold.transfer(address(3), 700 ether);
        vm.prank(address(3));
        gold.approve(address(staking), 700 ether);

        vm.prank(staking.owner());
        staking.notifyRewardAmount(1000 ether);

        vm.prank(address(2));
        staking.stake(300 ether);
        vm.prank(address(3));
        staking.stake(700 ether);

        // Warp halfway through rewards
        vm.warp(block.timestamp + 3 days);

        uint256 earned2 = staking.earned(address(2));
        uint256 earned3 = staking.earned(address(3));

        // earned3 should be roughly proportional to stake
        assertApproxEqRel(earned2 * 10, earned3 * 3, 0.1); // allow 10% relative error tolerance
    }
}
