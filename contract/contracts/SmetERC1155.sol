// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./InputValidator.sol";

contract SmetLoot is ERC1155 {
    constructor() ERC1155("https://loot.example/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount) external {
        InputValidator.validateAddress(to);
        InputValidator.validateAmount(amount);
        _mint(to, id, amount, "");
    }
    
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override {
        InputValidator.validateAddress(from);
        InputValidator.validateAddress(to);
        InputValidator.validateAmount(amount);
        super.safeTransferFrom(from, to, id, amount, data);
    }
    
    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public override {
        InputValidator.validateAddress(from);
        InputValidator.validateAddress(to);
        InputValidator.validateArrayLength(ids.length);
        InputValidator.validateArrayLengths(ids.length, amounts.length);
        for (uint256 i = 0; i < amounts.length; i++) {
            InputValidator.validateAmount(amounts[i]);
        }
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }
    
    function setApprovalForAll(address operator, bool approved) public override {
        InputValidator.validateAddress(operator);
        super.setApprovalForAll(operator, approved);
    }
}