// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./CircuitBreaker.sol";

contract SmetLoot is ERC1155, CircuitBreaker {
    constructor() ERC1155("https://loot.example/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount) external circuitBreakerCheck(this.mint.selector) {
        _mint(to, id, amount, "");
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) public override circuitBreakerCheck(this.safeTransferFrom.selector) {
        super.safeTransferFrom(from, to, id, value, data);
    }

    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) public override circuitBreakerCheck(this.safeBatchTransferFrom.selector) {
        super.safeBatchTransferFrom(from, to, ids, values, data);
    }

    function setApprovalForAll(address operator, bool approved) public override circuitBreakerCheck(this.setApprovalForAll.selector) {
        super.setApprovalForAll(operator, approved);
    }
}