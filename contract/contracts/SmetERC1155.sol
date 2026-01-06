// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./CircuitBreaker.sol";
import "./TransactionHistory.sol";

contract SmetLoot is ERC1155, CircuitBreaker {
    TransactionHistory public transactionHistory;
    
    constructor(address _transactionHistory) ERC1155("https://loot.example/{id}.json") {
        transactionHistory = TransactionHistory(_transactionHistory);
    }

    function mint(address to, uint256 id, uint256 amount) external circuitBreakerCheck(this.mint.selector) {
        _mint(to, id, amount, "");
        
        transactionHistory.recordTransaction(
            to,
            address(this),
            "MINT",
            amount,
            id
        );
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) public override circuitBreakerCheck(this.safeTransferFrom.selector) {
        super.safeTransferFrom(from, to, id, value, data);
        
        transactionHistory.recordTransaction(
            from,
            address(this),
            "TRANSFER",
            value,
            id
        );
    }

    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) public override circuitBreakerCheck(this.safeBatchTransferFrom.selector) {
        super.safeBatchTransferFrom(from, to, ids, values, data);
        
        // Record batch transfer as single transaction with total value
        uint256 totalValue = 0;
        for (uint256 i = 0; i < values.length; i++) {
            totalValue += values[i];
        }
        
        transactionHistory.recordTransaction(
            from,
            address(this),
            "BATCH_TRANSFER",
            totalValue,
            ids.length
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
