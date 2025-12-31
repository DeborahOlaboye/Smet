// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract SmetLoot is ERC1155 {
    constructor() ERC1155("https://loot.example/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount) external {
        _mint(to, id, amount, "");
    }

    function batchMint(address[] calldata recipients, uint256[] calldata ids, uint256[] calldata amounts) external {
        require(recipients.length == ids.length && ids.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], ids[i], amounts[i], "");
        }
    }
}