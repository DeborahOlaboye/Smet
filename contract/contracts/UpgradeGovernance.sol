// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IUpgradeable {
    function upgradeTo(address newImplementation) external;
    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable;
}

contract UpgradeGovernance is AccessControl, ReentrancyGuard {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    
    uint256 public constant VOTING_DELAY = 1 days;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant EXECUTION_DELAY = 2 days;
    
    struct UpgradeProposal {
        address target;
        address newImplementation;
        bytes data;
        uint256 proposedAt;
        uint256 votingEnds;
        uint256 executionTime;
        bool executed;
        bool cancelled;
        uint256 forVotes;
        uint256 againstVotes;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice;
    }
    
    mapping(uint256 => UpgradeProposal) public proposals;
    uint256 public proposalCount;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed target, address newImplementation);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
    }
    
    function propose(
        address target,
        address newImplementation,
        bytes calldata data
    ) external onlyRole(PROPOSER_ROLE) returns (uint256) {
        uint256 proposalId = proposalCount++;
        UpgradeProposal storage proposal = proposals[proposalId];
        
        proposal.target = target;
        proposal.newImplementation = newImplementation;
        proposal.data = data;
        proposal.proposedAt = block.timestamp;
        proposal.votingEnds = block.timestamp + VOTING_DELAY + VOTING_PERIOD;
        proposal.executionTime = proposal.votingEnds + EXECUTION_DELAY;
        
        emit ProposalCreated(proposalId, target, newImplementation);
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) external onlyRole(EXECUTOR_ROLE) {
        UpgradeProposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.proposedAt + VOTING_DELAY, "Voting not started");
        require(block.timestamp <= proposal.votingEnds, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voteChoice[msg.sender] = support;
        
        if (support) {
            proposal.forVotes++;
        } else {
            proposal.againstVotes++;
        }
        
        emit VoteCast(proposalId, msg.sender, support);
    }
    
    function execute(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) nonReentrant {
        UpgradeProposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.executionTime, "Execution too early");
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        
        if (proposal.data.length > 0) {
            IUpgradeable(proposal.target).upgradeToAndCall(proposal.newImplementation, proposal.data);
        } else {
            IUpgradeable(proposal.target).upgradeTo(proposal.newImplementation);
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    function cancel(uint256 proposalId) external onlyRole(GUARDIAN_ROLE) {
        UpgradeProposal storage proposal = proposals[proposalId];
        
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Already cancelled");
        
        proposal.cancelled = true;
        emit ProposalCancelled(proposalId);
    }
    
    function getProposalState(uint256 proposalId) external view returns (string memory) {
        UpgradeProposal storage proposal = proposals[proposalId];
        
        if (proposal.cancelled) return "Cancelled";
        if (proposal.executed) return "Executed";
        if (block.timestamp <= proposal.proposedAt + VOTING_DELAY) return "Pending";
        if (block.timestamp <= proposal.votingEnds) return "Active";
        if (proposal.forVotes <= proposal.againstVotes) return "Defeated";
        if (block.timestamp < proposal.executionTime) return "Queued";
        return "Executable";
    }
    
    function getVotes(uint256 proposalId) external view returns (uint256 forVotes, uint256 againstVotes) {
        UpgradeProposal storage proposal = proposals[proposalId];
        return (proposal.forVotes, proposal.againstVotes);
    }
}