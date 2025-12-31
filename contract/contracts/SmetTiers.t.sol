// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./SmetTiers.sol";
import "./SmetERC20.sol";
import "./SmetStaking.sol";
import "./SmetReward.sol";

contract SmetTiersTest is Test {
    SmetGold gold;
    SmetStaking stake;
    SmetTiers tiers;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        gold = new SmetGold();
        // Use gold as both staking and reward token for tests
        stake = new SmetStaking(IERC20(address(gold)), IERC20(address(gold)), 7 days);

        // thresholds: bronze=10, silver=100, gold=1000, platinum=10000
        tiers = new SmetTiers(10 ether, 100 ether, 1000 ether, 10000 ether);
        tiers.setStakingContract(stake);

        // Deploy a minimal SmetReward to test integration
        Reward[] memory prizes = new Reward[](1);
        prizes[0] = Reward(1, address(gold), 100 ether, 0);
        uint32[] memory w = new uint32[](1);
        w[0] = 100;
        // the SmetReward constructor signature is (address _coordinator, uint256 _subId, bytes32 _keyHash, uint256 _fee, uint256 _cooldownSeconds, uint32[] memory _weights, Reward[] memory _prizes)
        // In tests we can pass zeros for VRF parameters and cooldown
        SmetReward box = new SmetReward(address(0), 0, keccak256("keyHash"), 0, 0, w, prizes);
        box.setTiersContract(address(tiers));

        // store for later assertions
        vm.label(address(box), "box");

        // Give users some gold
        gold.transfer(alice, 2000 ether);
        gold.transfer(bob, 50 ether);

        // Approve and stake
        vm.startPrank(alice);
        gold.approve(address(stake), 2000 ether);
        stake.stake(1500 ether); // alice stakes 1500 -> Gold tier
        vm.stopPrank();

        vm.startPrank(bob);
        gold.approve(address(stake), 50 ether);
        stake.stake(50 ether); // bob stakes 50 -> Bronze tier
        vm.stopPrank();
    }

    function test_tiersComputed() public {
        // alice should be Gold
        uint8 aliceTier = tiers.getTierId(alice);
        assertEq(aliceTier, uint8(SmetTiers.Tier.Gold));

        // bob should be Bronze
        uint8 bobTier = tiers.getTierId(bob);
        assertEq(bobTier, uint8(SmetTiers.Tier.Bronze));
    }

    function test_rewardIntegrationTier() public {
        // Deploy a SmetReward temporarily and set the tiers contract
        Reward[] memory prizes = new Reward[](1);
        prizes[0] = Reward(1, address(gold), 100 ether);
        uint32[] memory w = new uint32[](1);
        w[0] = 100;
        SmetReward box = new SmetReward(address(0), 0, keccak256("keyHash"), 0, 0, w, prizes);
        box.setTiersContract(address(tiers));

        // alice has Gold tier
        uint8 t = box.getTierOf(alice);
        assertEq(t, uint8(SmetTiers.Tier.Gold));
    }

    function test_platinumThreshold() public {
        // alice should be Gold
        uint8 aliceTier = tiers.getTierId(alice);
        assertEq(aliceTier, uint8(SmetTiers.Tier.Gold));

        // bob should be Bronze
        uint8 bobTier = tiers.getTierId(bob);
        assertEq(bobTier, uint8(SmetTiers.Tier.Bronze));
    }

    function test_platinumThreshold() public {
        // increase alice stake to reach platinum
        vm.startPrank(alice);
        gold.approve(address(stake), 10000 ether);
        stake.stake(9000 ether); // total 10500
        vm.stopPrank();

        uint8 t = tiers.getTierId(alice);
        assertEq(t, uint8(SmetTiers.Tier.Platinum));
    }

    function test_setThresholdsValidation() public {
        vm.expectRevert("invalid thresholds");
        tiers.setThresholds(1000, 10, 100, 10000);
    }

    function test_tiersWithoutStakingContract() public {
        SmetTiers t = new SmetTiers(1, 2, 3, 4);
        // no staking contract set -> all users should be None
        uint8 a = t.getTierId(alice);
        assertEq(a, uint8(SmetTiers.Tier.None));
    }

    function test_setThresholdsEmits() public {
        vm.expectEmit(true, false, false, false);
        emit StakingContractUpdated(address(stake));
        tiers.setStakingContract(stake);
    }
}
