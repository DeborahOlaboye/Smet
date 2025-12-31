// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CircuitBreaker is Pausable, Ownable {
    uint256 public constant MAX_DAILY_OPERATIONS = 1000;
    uint256 public constant DAILY_RESET_PERIOD = 24 hours;
    
    uint256 public dailyOperationCount;
    uint256 public lastResetTime;
    
    event CircuitBreakerTriggered(string reason, uint256 operationCount);
    event DailyLimitReset(uint256 newResetTime);
    
    constructor() Ownable(msg.sender) {
        lastResetTime = block.timestamp;
    }
    
    modifier circuitBreakerCheck() {
        _checkDailyLimit();
        _;
        _incrementOperationCount();
    }
    
    function _checkDailyLimit() internal {
        if (block.timestamp >= lastResetTime + DAILY_RESET_PERIOD) {
            dailyOperationCount = 0;
            lastResetTime = block.timestamp;
            emit DailyLimitReset(lastResetTime);
        }
        
        if (dailyOperationCount >= MAX_DAILY_OPERATIONS) {
            _pause();
            emit CircuitBreakerTriggered("Daily operation limit exceeded", dailyOperationCount);
        }
    }
    
    function _incrementOperationCount() internal {
        dailyOperationCount++;
    }
    
    function emergencyPause() external onlyOwner {
        _pause();
        emit CircuitBreakerTriggered("Emergency pause activated", dailyOperationCount);
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
}