// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./CircuitBreaker.sol";

contract SmetLoot is ERC1155, CircuitBreaker {
    constructor() ERC1155("https://loot.example/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount) external circuitBreakerCheck(this.mint.selector) {
        _mint(to, id, amount, "");
        emit LootMinted(to, id, amount);
    }
    
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) external onlyTimelock {
        _mintBatch(to, ids, amounts, "");
    }
    
    function setURI(string memory newURI) external onlyTimelock {
        _setURI(newURI);
        emit URIUpdated(newURI);
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
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function setEmergencyRecovery(address _emergencyRecovery) external onlyOwner {
        emergencyRecovery = _emergencyRecovery;
        emit EmergencyRecoverySet(_emergencyRecovery);
    }
    
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override whenNotPaused {
        super.safeTransferFrom(from, to, id, amount, data);
    }
    
    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public override whenNotPaused {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) public override circuitBreakerCheck(this.safeTransferFrom.selector) {
        super.safeTransferFrom(from, to, id, value, data);
    }

    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) public override circuitBreakerCheck(this.safeBatchTransferFrom.selector) {
        super.safeBatchTransferFrom(from, to, ids, values, data);
    }

    function setApprovalForAll(address operator, bool approved) public override circuitBreakerCheck(this.setApprovalForAll.selector) {
        super.setApprovalForAll(operator, approved);
    }
}
