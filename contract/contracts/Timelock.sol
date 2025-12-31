// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Timelock is AccessControl, ReentrancyGuard {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");
    
    uint256 public constant MIN_DELAY = 1 hours;
    uint256 public constant MAX_DELAY = 30 days;
    uint256 public delay;
    
    mapping(bytes32 => bool) public queuedTransactions;
    
    event TransactionQueued(bytes32 indexed txHash, address indexed target, uint256 value, bytes data, uint256 eta);
    event TransactionExecuted(bytes32 indexed txHash, address indexed target, uint256 value, bytes data);
    event TransactionCancelled(bytes32 indexed txHash);
    event DelayChanged(uint256 oldDelay, uint256 newDelay);
    
    constructor(uint256 _delay) {
        require(_delay >= MIN_DELAY && _delay <= MAX_DELAY, "Invalid delay");
        delay = _delay;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        _grantRole(CANCELLER_ROLE, msg.sender);
    }
    
    function queueTransaction(address target, uint256 value, bytes calldata data) external onlyRole(PROPOSER_ROLE) returns (bytes32) {
        uint256 eta = block.timestamp + delay;
        bytes32 txHash = keccak256(abi.encode(target, value, data, eta));
        
        queuedTransactions[txHash] = true;
        emit TransactionQueued(txHash, target, value, data, eta);
        
        return txHash;
    }
    
    function executeTransaction(address target, uint256 value, bytes calldata data, uint256 eta) external payable onlyRole(EXECUTOR_ROLE) nonReentrant returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, data, eta));
        
        require(queuedTransactions[txHash], "Transaction not queued");
        require(block.timestamp >= eta, "Transaction not ready");
        require(block.timestamp <= eta + 7 days, "Transaction expired");
        
        queuedTransactions[txHash] = false;
        
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Transaction execution failed");
        
        emit TransactionExecuted(txHash, target, value, data);
        return result;
    }
    
    function cancelTransaction(address target, uint256 value, bytes calldata data, uint256 eta) external onlyRole(CANCELLER_ROLE) {
        bytes32 txHash = keccak256(abi.encode(target, value, data, eta));
        
        require(queuedTransactions[txHash], "Transaction not queued");
        queuedTransactions[txHash] = false;
        
        emit TransactionCancelled(txHash);
    }
    
    function updateDelay(uint256 newDelay) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newDelay >= MIN_DELAY && newDelay <= MAX_DELAY, "Invalid delay");
        uint256 oldDelay = delay;
        delay = newDelay;
        emit DelayChanged(oldDelay, newDelay);
    }
    
    receive() external payable {}
}