// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract SmetLoot is ERC1155 {
    // ERC1155 contract used for multi-token loot items.
    // The URI template can be resolved by clients to fetch per-item metadata.
    constructor() ERC1155("https://loot.example/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount) external {
        // Mint `amount` of token `id` to `to`.
        _mint(to, id, amount, "");
    }
}