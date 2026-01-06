// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./SmetReward.sol";

contract RewardAnalytics {
    struct RewardStats {
        uint256 totalOpened;
        uint256 totalClaimed;
        uint256 totalValue;
        mapping(uint256 => uint256) rewardCounts;
    }

    struct ProbabilityData {
        uint256 rewardIndex;
        uint32 weight;
        uint256 probability; // Scaled by 10000 (e.g., 2500 = 25%)
    }

    mapping(address => RewardStats) public contractStats;
    mapping(address => bool) public authorizedContracts;
    address public owner;

    event RewardOpened(address indexed contract_, address indexed user, uint256 rewardIndex);
    event StatsUpdated(address indexed contract_, uint256 totalOpened, uint256 totalClaimed);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender], "Not authorized");
        _;
    }

    function authorizeContract(address contract_) external onlyOwner {
        authorizedContracts[contract_] = true;
    }

    function recordRewardOpened(address user, uint256 rewardIndex) external onlyAuthorized {
        contractStats[msg.sender].totalOpened++;
        contractStats[msg.sender].rewardCounts[rewardIndex]++;
        emit RewardOpened(msg.sender, user, rewardIndex);
    }

    function recordRewardClaimed(uint256 value) external onlyAuthorized {
        contractStats[msg.sender].totalClaimed++;
        contractStats[msg.sender].totalValue += value;
        emit StatsUpdated(msg.sender, contractStats[msg.sender].totalOpened, contractStats[msg.sender].totalClaimed);
    }

    function getRewardDistribution(address contract_, uint256 maxRewards) external view returns (uint256[] memory) {
        uint256[] memory distribution = new uint256[](maxRewards);
        for (uint256 i = 0; i < maxRewards; i++) {
            distribution[i] = contractStats[contract_].rewardCounts[i];
        }
        return distribution;
    }

    function getContractStats(address contract_) external view returns (uint256 totalOpened, uint256 totalClaimed, uint256 totalValue) {
        RewardStats storage stats = contractStats[contract_];
        return (stats.totalOpened, stats.totalClaimed, stats.totalValue);
    }

    function calculateProbabilities(uint32[] memory weights) external pure returns (ProbabilityData[] memory) {
        uint32 totalWeight = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            totalWeight += weights[i];
        }

        ProbabilityData[] memory probabilities = new ProbabilityData[](weights.length);
        for (uint256 i = 0; i < weights.length; i++) {
            probabilities[i] = ProbabilityData({
                rewardIndex: i,
                weight: weights[i],
                probability: (weights[i] * 10000) / totalWeight
            });
        }

        return probabilities;
    }
}