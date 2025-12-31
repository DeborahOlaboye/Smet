// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "../contracts/SmetReward.sol";
import "../contracts/SmetERC20.sol";

contract TestSmetReward is SmetReward {
    constructor(uint32[] memory weights, Reward[] memory prizes)
        SmetReward(address(0), 0, bytes32(0), 0, 0, weights, prizes) {}

    /// @notice Expose the selection logic used by fulfillRandomWords for testing
    function selectIndexFromRandom(uint256 rnd) public view returns (uint256) {
        uint256 total = cdf[cdf.length - 1];
        uint256 r = rnd % total;

        uint256 low = 0;
        uint256 high = cdf.length - 1;
        while (low < high) {
            uint256 mid = (low + high) >> 1;
            if (r < cdf[mid]) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        return low;
    }
}

contract SmetRewardFuzz is Test {
    /// @notice Ensure selection index is always within bounds for random inputs
    function test_selectIndex_bounds(uint256 rnd, uint32 w1, uint32 w2, uint32 w3) public {
        // Ensure non-zero weights and reasonable sizes to avoid trivial total==0
        uint32 a = (w1 % 100) + 1;
        uint32 b = (w2 % 100) + 1;
        uint32 c = (w3 % 100) + 1;

        uint32[] memory weights = new uint32[](3);
        weights[0] = a;
        weights[1] = b;
        weights[2] = c;

        Reward[] memory prizes = new Reward[](3);
        prizes[0] = Reward({assetType: 1, token: address(0), idOrAmount: 0, availableAfter: 0});
        prizes[1] = Reward({assetType: 1, token: address(0), idOrAmount: 0, availableAfter: 0});
        prizes[2] = Reward({assetType: 1, token: address(0), idOrAmount: 0, availableAfter: 0});

        TestSmetReward tr = new TestSmetReward(weights, prizes);
        uint256 idx = tr.selectIndexFromRandom(rnd);
        assertLt(idx, 3);
    }

    /// @notice Refill increases the ERC20 token balance held by the contract
    function test_refill_increases_balance(uint256 amount) public {
        vm.assume(amount > 0 && amount < 1e24);

        SmetGold g = new SmetGold();

        uint32[] memory weights = new uint32[](1);
        weights[0] = 1;
        Reward[] memory prizes = new Reward[](1);
        prizes[0] = Reward({assetType: 1, token: address(g), idOrAmount: 0, availableAfter: 0});

        TestSmetReward tr = new TestSmetReward(weights, prizes);

        g.approve(address(tr), amount);
        uint256 before = g.balanceOf(address(tr));
        tr.refill(g, amount);
        assertEq(g.balanceOf(address(tr)), before + amount);
    }
}
