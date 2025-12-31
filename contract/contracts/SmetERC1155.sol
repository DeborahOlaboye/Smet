// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title SmetLoot
 * @notice ERC1155 contract for multi-token loot items used by the rewards system.
 * @dev Clients can resolve `{id}` in the URI template to fetch per-item metadata.
 */
contract SmetLoot is ERC1155 {
    event BatchMintCompleted(address indexed minter, uint256 count);
    event BatchTransferCompleted(address indexed sender, uint256 count);
    
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

    function batchMint(address[] calldata recipients, uint256[] calldata ids, uint256[] calldata amounts) external {
        require(recipients.length == ids.length && ids.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], ids[i], amounts[i], "");
        }
        emit BatchMintCompleted(msg.sender, recipients.length);
    }

    function batchTransfer(address[] calldata to, uint256[] calldata ids, uint256[] calldata amounts) external {
        require(to.length == ids.length && ids.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < to.length; i++) {
            safeTransferFrom(msg.sender, to[i], ids[i], amounts[i], "");
        }
        emit BatchTransferCompleted(msg.sender, to.length);
    }

    function batchApproval(address[] calldata operators, bool[] calldata approved) external {
        require(operators.length == approved.length, "Length mismatch");
        for (uint256 i = 0; i < operators.length; i++) {
            setApprovalForAll(operators[i], approved[i]);
        }
    }
}
