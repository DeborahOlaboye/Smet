// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SmetLoot is ERC1155, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    
    constructor() ERC1155("https://loot.example/{id}.json") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 id, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, id, amount, "");
    }
    
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mintBatch(to, ids, amounts, "");
    }
    
    function setURI(string memory newURI) external onlyRole(URI_SETTER_ROLE) {
        _setURI(newURI);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override whenNotPaused {
        super.safeTransferFrom(from, to, id, amount, data);
    }
    
    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public override whenNotPaused {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function grantMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }
    
    function revokeMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
    }
    
    function grantPauserRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(PAUSER_ROLE, account);
    }
    
    function revokePauserRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(PAUSER_ROLE, account);
    }
    
    function grantUriSetterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(URI_SETTER_ROLE, account);
    }
    
    function revokeUriSetterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(URI_SETTER_ROLE, account);
    }
    
    function burn(address from, uint256 id, uint256 amount) external whenNotPaused {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Not approved");
        _burn(from, id, amount);
    }
    
    function burnBatch(address from, uint256[] memory ids, uint256[] memory amounts) external whenNotPaused {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Not approved");
        _burnBatch(from, ids, amounts);
    }
}