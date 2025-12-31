// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CircuitBreaker.sol";
import "./TransactionHistory.sol";

contract SmetGold is ERC20, CircuitBreaker {
    TransactionHistory public transactionHistory;
    
    constructor(address _transactionHistory) ERC20("SmetGold", "SGOLD") {
        _mint(msg.sender, 10000000 ether);
        transactionHistory = TransactionHistory(_transactionHistory);
    }

    function transfer(address to, uint256 value) public override circuitBreakerCheck(this.transfer.selector) returns (bool) {
        bool success = super.transfer(to, value);
        if (success) {
            transactionHistory.recordTransaction(
                msg.sender,
                address(this),
                "TRANSFER",
                value,
                0
            );
        }
        return success;
    }

    function transferFrom(address from, address to, uint256 value) public override circuitBreakerCheck(this.transferFrom.selector) returns (bool) {
        bool success = super.transferFrom(from, to, value);
        if (success) {
            transactionHistory.recordTransaction(
                from,
                address(this),
                "TRANSFER_FROM",
                value,
                0
            );
        }
        return success;
    }

    function approve(address spender, uint256 value) public override circuitBreakerCheck(this.approve.selector) returns (bool) {
        bool success = super.approve(spender, value);
        if (success) {
            transactionHistory.recordTransaction(
                msg.sender,
                address(this),
                "APPROVE",
                value,
                0
            );
        }
        return success;
    }
}
