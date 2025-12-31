// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SmetStaking.sol";

/**
 * @title SmetTiers
 * @notice Simple tiering contract. Tiers are computed based on staked balances
 * in a configured `SmetStaking` contract as well as optional token holdings.
 * Owner can configure thresholds for tiers.
 */
contract SmetTiers is Ownable {
    // Tier enum where higher numeric value == better tier
    enum Tier { None, Bronze, Silver, Gold, Platinum }

    // Thresholds for each tier (in staking token units)
    uint256 public bronzeThreshold;
    uint256 public silverThreshold;
    uint256 public goldThreshold;
    uint256 public platinumThreshold;

    // Optional staking contract used to compute staked balances
    SmetStaking public stakingContract;

    event ThresholdsUpdated(uint256 bronze, uint256 silver, uint256 gold, uint256 platinum);
    event StakingContractUpdated(address indexed stakingContract);

    constructor(uint256 _bronze, uint256 _silver, uint256 _gold, uint256 _platinum) {
        require(_bronze <= _silver && _silver <= _gold && _gold <= _platinum, "invalid thresholds");
        bronzeThreshold = _bronze;
        silverThreshold = _silver;
        goldThreshold = _gold;
        platinumThreshold = _platinum;
    }

    function setThresholds(uint256 _bronze, uint256 _silver, uint256 _gold, uint256 _platinum) external onlyOwner {
        require(_bronze <= _silver && _silver <= _gold && _gold <= _platinum, "invalid thresholds");
        bronzeThreshold = _bronze;
        silverThreshold = _silver;
        goldThreshold = _gold;
        platinumThreshold = _platinum;
        emit ThresholdsUpdated(_bronze, _silver, _gold, _platinum);
    }

    function setStakingContract(SmetStaking _staking) external onlyOwner {
        stakingContract = _staking;
        emit StakingContractUpdated(address(_staking));
    }

    /**
     * @notice Compute the Tier for `user` based on staking balance.
     * @dev Returns highest Tier satisfying thresholds, or Tier.None if none.
     */
    function getTier(address user) public view returns (Tier) {
        if (address(stakingContract) == address(0)) {
            return Tier.None;
        }
        uint256 bal = stakingContract.balanceOf(user);
        if (bal >= platinumThreshold) {
            return Tier.Platinum;
        } else if (bal >= goldThreshold) {
            return Tier.Gold;
        } else if (bal >= silverThreshold) {
            return Tier.Silver;
        } else if (bal >= bronzeThreshold) {
            return Tier.Bronze;
        }
        return Tier.None;
    }

    /**
     * @notice Helper returning an integer representation of Tier for easier UIs.
     */
    function getTierId(address user) external view returns (uint8) {
        return uint8(getTier(user));
    }
}
