// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CircuitBreaker.sol";

contract SmetGold is ERC20, CircuitBreaker {
    constructor() ERC20("SmetGold", "SGOLD") {
        _mint(msg.sender, 10000000 ether);
    }

    function transfer(address to, uint256 value) public override circuitBreakerCheck(this.transfer.selector) returns (bool) {
        return super.transfer(to, value);
    }

    function transferFrom(address from, address to, uint256 value) public override circuitBreakerCheck(this.transferFrom.selector) returns (bool) {
        return super.transferFrom(from, to, value);
    }

    function approve(address spender, uint256 value) public override circuitBreakerCheck(this.approve.selector) returns (bool) {
        return super.approve(spender, value);
    }
}