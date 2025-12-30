// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title SmetLoot
 * @notice ERC1155 contract for multi-token loot items used by the rewards system.
 * @dev Clients can resolve `{id}` in the URI template to fetch per-item metadata.
 */
contract SmetLoot is ERC1155 {
    /** @notice Deploy the SmetLoot contract with an off-chain URI template. */
    constructor() ERC1155("https://loot.example/{id}.json") {}

    /**
     * @notice Mint `amount` units of token `id` to address `to`.
     * @param to Recipient of the minted tokens.
     * @param id Token id to mint.
     * @param amount Number of units to mint.
     */
    function mint(address to, uint256 id, uint256 amount) external {
        // Mint `amount` of token `id` to `to`.
        _mint(to, id, amount, "");
    }
} 