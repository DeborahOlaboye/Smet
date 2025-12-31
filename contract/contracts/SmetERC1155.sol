// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetLoot is ERC1155, Pausable, Ownable {
    event ContractPaused(address indexed pauser, string reason);
    event ContractUnpaused(address indexed unpauser);
    event LootMinted(address indexed to, uint256 indexed id, uint256 amount, address indexed minter);
    event LootBurned(address indexed from, uint256 indexed id, uint256 amount, address indexed burner);
    event URIUpdated(string newURI, address indexed updater);
    event BatchLootMinted(address indexed to, uint256[] ids, uint256[] amounts, address indexed minter);
    event OwnershipTransferInitiated(address indexed previousOwner, address indexed newOwner);
    
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
        emit LootMinted(to, id, amount, msg.sender);
    }
    
    function burn(address from, uint256 id, uint256 amount) external whenNotPaused {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Not approved");
        _burn(from, id, amount);
        emit LootBurned(from, id, amount, msg.sender);
    }
    
    function setURI(string memory newURI) external onlyOwner {
        _setURI(newURI);
        emit URIUpdated(newURI, msg.sender);
    }
    
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) external whenNotPaused {
        _mintBatch(to, ids, amounts, "");
        emit BatchLootMinted(to, ids, amounts, msg.sender);
    }
    
    function transferOwnership(address newOwner) public override onlyOwner {
        address oldOwner = owner();
        super.transferOwnership(newOwner);
        emit OwnershipTransferInitiated(oldOwner, newOwner);
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
