// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EmergencyPause is Pausable, Ownable {
    event EmergencyPauseActivated(address indexed activator, string reason);
    event EmergencyPauseDeactivated(address indexed deactivator);
    
    string public pauseReason;
    
    constructor() Ownable(msg.sender) {}
    
    function emergencyPause(string calldata reason) external onlyOwner {
        pauseReason = reason;
        _pause();
        emit EmergencyPauseActivated(msg.sender, reason);
    }
    
    function emergencyUnpause() external onlyOwner {
        pauseReason = "";
        _unpause();
        emit EmergencyPauseDeactivated(msg.sender);
    }
}