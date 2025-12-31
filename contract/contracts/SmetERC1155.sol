// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetLoot is ERC1155, Pausable, Ownable {
    event ContractPaused(address indexed pauser, string reason);
    event ContractUnpaused(address indexed unpauser);
    
    constructor() ERC1155("https://loot.example/{id}.json") Ownable(msg.sender) {}
    
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender, "Manual pause");
    }
    
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    function mint(address to, uint256 id, uint256 amount) external whenNotPaused {
        _mint(to, id, amount, "");
    }
    
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override whenNotPaused {
        super.safeTransferFrom(from, to, id, amount, data);
    }
    
    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public override whenNotPaused {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }
    
    function setApprovalForAll(address operator, bool approved) public override whenNotPaused {
        super.setApprovalForAll(operator, approved);
    }
}