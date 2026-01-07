// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract EmergencyRecovery is AccessControl, ReentrancyGuard {
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant RECOVERY_ROLE = keccak256("RECOVERY_ROLE");
    
    struct RecoveryRequest {
        address requester;
        address target;
        bytes data;
        uint256 timestamp;
        bool executed;
        uint256 approvals;
    }
    
    mapping(uint256 => RecoveryRequest) public recoveryRequests;
    mapping(uint256 => mapping(address => bool)) public hasApproved;
    uint256 public nextRequestId;
    uint256 public constant APPROVAL_THRESHOLD = 2;
    uint256 public constant TIMELOCK_DURATION = 24 hours;
    
    event EmergencyPause(address indexed contract_, address indexed executor);
    event RecoveryRequested(uint256 indexed requestId, address indexed requester, address target);
    event RecoveryApproved(uint256 indexed requestId, address indexed approver);
    event RecoveryExecuted(uint256 indexed requestId, address indexed executor);
    event FundsRecovered(address indexed token, uint256 amount, address indexed recipient);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        _grantRole(RECOVERY_ROLE, msg.sender);
    }
    
    function emergencyPause(address target) external onlyRole(EMERGENCY_ROLE) {
        (bool success,) = target.call(abi.encodeWithSignature("pause()"));
        require(success, "Pause failed");
        emit EmergencyPause(target, msg.sender);
    }
    
    function requestRecovery(address target, bytes calldata data) external onlyRole(RECOVERY_ROLE) returns (uint256) {
        uint256 requestId = nextRequestId++;
        recoveryRequests[requestId] = RecoveryRequest({
            requester: msg.sender,
            target: target,
            data: data,
            timestamp: block.timestamp,
            executed: false,
            approvals: 0
        });
        
        emit RecoveryRequested(requestId, msg.sender, target);
        return requestId;
    }
    
    function approveRecovery(uint256 requestId) external onlyRole(RECOVERY_ROLE) {
        require(!hasApproved[requestId][msg.sender], "Already approved");
        require(!recoveryRequests[requestId].executed, "Already executed");
        
        hasApproved[requestId][msg.sender] = true;
        recoveryRequests[requestId].approvals++;
        
        emit RecoveryApproved(requestId, msg.sender);
    }
    
    function executeRecovery(uint256 requestId) external onlyRole(RECOVERY_ROLE) nonReentrant {
        RecoveryRequest storage request = recoveryRequests[requestId];
        require(!request.executed, "Already executed");
        require(request.approvals >= APPROVAL_THRESHOLD, "Insufficient approvals");
        require(block.timestamp >= request.timestamp + TIMELOCK_DURATION, "Timelock not expired");
        
        request.executed = true;
        
        (bool success,) = request.target.call(request.data);
        require(success, "Recovery call failed");
        
        emit RecoveryExecuted(requestId, msg.sender);
    }
    
    function recoverERC20(address token, uint256 amount, address recipient) external onlyRole(EMERGENCY_ROLE) nonReentrant {
        IERC20(token).transfer(recipient, amount);
        emit FundsRecovered(token, amount, recipient);
    }
    
    function recoverERC721(address token, uint256 tokenId, address recipient) external onlyRole(EMERGENCY_ROLE) nonReentrant {
        IERC721(token).safeTransferFrom(address(this), recipient, tokenId);
        emit FundsRecovered(token, tokenId, recipient);
    }
    
    function recoverERC1155(address token, uint256 id, uint256 amount, address recipient) external onlyRole(EMERGENCY_ROLE) nonReentrant {
        IERC1155(token).safeTransferFrom(address(this), recipient, id, amount, "");
        emit FundsRecovered(token, amount, recipient);
    }
    
    function recoverETH(uint256 amount, address payable recipient) external onlyRole(EMERGENCY_ROLE) nonReentrant {
        recipient.transfer(amount);
        emit FundsRecovered(address(0), amount, recipient);
    }
}