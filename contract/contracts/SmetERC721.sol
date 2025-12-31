// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./CircuitBreaker.sol";
import "./TransactionHistory.sol";

contract SmetHero is ERC721, CircuitBreaker {
    uint256 public nextId = 1;
    TransactionHistory public transactionHistory;

    constructor(address _transactionHistory) ERC721("SmetHero", "SHERO") {
        transactionHistory = TransactionHistory(_transactionHistory);
    }

    function mint(address to) external circuitBreakerCheck(this.mint.selector) returns (uint256 id) {
        id = nextId++;
        _safeMint(to, id);
        
        transactionHistory.recordTransaction(
            to,
            address(this),
            "MINT",
            0,
            id
        );
    }

    function transferFrom(address from, address to, uint256 tokenId) public override circuitBreakerCheck(this.transferFrom.selector) {
        super.transferFrom(from, to, tokenId);
        
        transactionHistory.recordTransaction(
            from,
            address(this),
            "TRANSFER",
            0,
            tokenId
        );
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override circuitBreakerCheck(this.safeTransferFrom.selector) {
        super.safeTransferFrom(from, to, tokenId);
        
        transactionHistory.recordTransaction(
            from,
            address(this),
            "SAFE_TRANSFER",
            0,
            tokenId
        );
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override circuitBreakerCheck(this.safeTransferFrom.selector) {
        super.safeTransferFrom(from, to, tokenId, data);
        
        transactionHistory.recordTransaction(
            from,
            address(this),
            "SAFE_TRANSFER_DATA",
            0,
            tokenId
        );
    }

    function approve(address to, uint256 tokenId) public override circuitBreakerCheck(this.approve.selector) {
        super.approve(to, tokenId);
        
        transactionHistory.recordTransaction(
            msg.sender,
            address(this),
            "APPROVE",
            0,
            tokenId
        );
    }

    function setApprovalForAll(address operator, bool approved) public override circuitBreakerCheck(this.setApprovalForAll.selector) {
        super.setApprovalForAll(operator, approved);
        
        transactionHistory.recordTransaction(
            msg.sender,
            address(this),
            approved ? "APPROVE_ALL" : "REVOKE_ALL",
            0,
            0
        );
    }
}