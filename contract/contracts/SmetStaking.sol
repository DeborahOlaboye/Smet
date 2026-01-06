// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmetStaking
 * @notice Simple staking contract using the reward-per-token accounting pattern.
 * @dev Users stake `stakingToken` to earn `rewardToken` at a global `rewardRate`.
 * Rewards are paid from tokens funded into the contract via `notifyRewardAmount`.
 */
contract SmetStaking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    // Duration for which a reward is distributed (seconds)
    uint256 public rewardsDuration;
    uint256 public periodFinish;

    uint256 public rewardRate; // reward tokens per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored; // scaled by 1e18

    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardAdded(uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);

    uint256 private constant SCALE = 1e18;

    /**
     * @param _stakingToken Token users stake.
     * @param _rewardToken Token used to pay rewards.
     * @param _rewardsDuration Duration (in seconds) for reward distribution.
     */
    constructor(IERC20 _stakingToken, IERC20 _rewardToken, uint256 _rewardsDuration) {
        require(address(_stakingToken) != address(0) && address(_rewardToken) != address(0), "zero addr");
        require(_rewardsDuration > 0, "duration=0");
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        rewardsDuration = _rewardsDuration;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        uint256 timeDelta = lastTimeRewardApplicable() - lastUpdateTime;
        return rewardPerTokenStored + (timeDelta * rewardRate * SCALE) / totalSupply;
    }

    function earned(address account) public view returns (uint256) {
        return (balances[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / SCALE + rewards[account];
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "!amount");
        totalSupply += amount;
        balances[msg.sender] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "!amount");
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function exit() external {
        withdraw(balances[msg.sender]);
        claimReward();
    }

    /**
     * @notice Fund the reward pool and start a new distribution period.
     * @dev Caller should transfer `reward` tokens to this contract before calling.
     * This will set the `rewardRate` as `reward / rewardsDuration`.
     * Any leftover from previous period is taken into account.
     */
    function notifyRewardAmount(uint256 reward) external onlyOwner updateReward(address(0)) {
        if (block.timestamp >= periodFinish) {
            rewardRate = reward / rewardsDuration;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            rewardRate = (reward + leftover) / rewardsDuration;
        }

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + rewardsDuration;

        emit RewardAdded(reward);
    }

    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(block.timestamp > periodFinish, "period not finished");
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(_rewardsDuration);
    }

    // Admin function to withdraw accidental tokens
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        require(tokenAddress != address(stakingToken), "cannot recover staking token");
        IERC20(tokenAddress).safeTransfer(owner(), tokenAmount);
    }

    // Views for convenience
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function getRewardForDuration() external view returns (uint256) {
        return rewardRate * rewardsDuration;
    }
}
