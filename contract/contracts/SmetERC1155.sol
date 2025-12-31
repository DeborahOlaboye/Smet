// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

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
        uint256 previousBalance = balanceOf(to, id);
        uint256 previousTotalSupply = totalSupplyById[id];
        
        _mint(to, id, amount, "");
        totalSupplyById[id] += amount;
        
        // Formal verification: Mint correctness
        assert(balanceOf(to, id) == previousBalance + amount);
        assert(totalSupplyById[id] == previousTotalSupply + amount);
    }
    
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override {
        uint256 fromBalanceBefore = balanceOf(from, id);
        uint256 toBalanceBefore = balanceOf(to, id);
        uint256 totalSupplyBefore = totalSupplyById[id];
        
        super.safeTransferFrom(from, to, id, amount, data);
        
        // Formal verification: Transfer correctness
        if (from != to) {
            assert(balanceOf(from, id) == fromBalanceBefore - amount);
            assert(balanceOf(to, id) == toBalanceBefore + amount);
        }
        assert(totalSupplyById[id] == totalSupplyBefore);
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
