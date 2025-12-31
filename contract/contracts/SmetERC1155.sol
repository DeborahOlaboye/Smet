// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./InputValidator.sol";

/**
 * @title SmetLoot
 * @notice ERC1155 contract for multi-token loot items used by the rewards system.
 * @dev Clients can resolve `{id}` in the URI template to fetch per-item metadata.
 */
contract SmetLoot is ERC1155 {
    mapping(uint256 => uint256) private totalSupplyById;
    
    constructor() ERC1155("https://loot.example/{id}.json") {}

    /**
     * @notice Mint `amount` units of token `id` to address `to`.
     * @param to Recipient of the minted tokens.
     * @param id Token id to mint.
     * @param amount Number of units to mint.
     */
    function mint(address to, uint256 id, uint256 amount) external {
        InputValidator.validateAddress(to);
        InputValidator.validateAmount(amount);
        _mint(to, id, amount, "");
        totalSupplyById[id] += amount;
        
        // Formal verification: Mint correctness
        assert(balanceOf(to, id) == previousBalance + amount);
        assert(totalSupplyById[id] == previousTotalSupply + amount);
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
    
    function batchMint(address[] calldata recipients, uint256[] calldata ids, uint256[] calldata amounts) external {
        InputValidator.validateArrayLength(recipients.length);
        InputValidator.validateBatchSize(recipients.length);
        InputValidator.validateArrayLengths(recipients.length, ids.length);
        InputValidator.validateArrayLengths(ids.length, amounts.length);
        for (uint256 i = 0; i < recipients.length; i++) {
            InputValidator.validateAddress(recipients[i]);
            InputValidator.validateAmount(amounts[i]);
        }
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], ids[i], amounts[i], "");
        }
    }
    
    function batchTransfer(address[] calldata to, uint256[] calldata ids, uint256[] calldata amounts) external {
        InputValidator.validateArrayLength(to.length);
        InputValidator.validateBatchSize(to.length);
        InputValidator.validateArrayLengths(to.length, ids.length);
        InputValidator.validateArrayLengths(ids.length, amounts.length);
        for (uint256 i = 0; i < to.length; i++) {
            InputValidator.validateAddress(to[i]);
            InputValidator.validateAmount(amounts[i]);
        }
        for (uint256 i = 0; i < to.length; i++) {
            safeTransferFrom(msg.sender, to[i], ids[i], amounts[i], "");
        }
    }
}
