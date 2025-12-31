// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CircuitBreaker is AccessControl {
    bytes32 public constant BREAKER_ROLE = keccak256("BREAKER_ROLE");
    
    mapping(address => bool) public circuitBroken;
    mapping(address => uint256) public breakTimestamp;
    
    uint256 public constant BREAK_DURATION = 1 hours;
    
    event CircuitBroken(address indexed contract_, address indexed breaker, string reason);
    event CircuitRestored(address indexed contract_, address indexed restorer);
    
    modifier notBroken(address contract_) {
        require(!isCircuitBroken(contract_), "Circuit broken");
        _;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BREAKER_ROLE, msg.sender);
    }
    
    function breakCircuit(address contract_, string calldata reason) external onlyRole(BREAKER_ROLE) {
        circuitBroken[contract_] = true;
        breakTimestamp[contract_] = block.timestamp;
        emit CircuitBroken(contract_, msg.sender, reason);
    }
    
    function restoreCircuit(address contract_) external onlyRole(BREAKER_ROLE) {
        circuitBroken[contract_] = false;
        emit CircuitRestored(contract_, msg.sender);
    }
    
    function isCircuitBroken(address contract_) public view returns (bool) {
        if (!circuitBroken[contract_]) return false;
        return block.timestamp < breakTimestamp[contract_] + BREAK_DURATION;
    }
}