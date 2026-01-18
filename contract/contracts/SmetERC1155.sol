// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CircuitBreaker.sol";
import "./TransactionHistory.sol";

contract SmetLoot is ERC1155, CircuitBreaker, Ownable {
    TransactionHistory public transactionHistory;
    address public minter;

    event MinterSet(address indexed newMinter);

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can call this function");
        _;
    }

    /**
     * @dev Access Control Implementation - Issue #89
     * The contract implements strict access control on the mint function to prevent
     * unauthorized loot item creation that could break the reward economy.
     *
     * Only the authorized minter address (set to SmetReward contract) can create new items.
     * This prevents public mint calls and ensures all loot items are created through the
     * official reward system.
     *
     * Owner can update the minter address via setMinter() function.
     */
    
    constructor(address _transactionHistory) ERC1155("https://loot.example/{id}.json") Ownable(msg.sender) {
        transactionHistory = TransactionHistory(_transactionHistory);
    }

    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Invalid minter address");
        minter = _minter;
        emit MinterSet(_minter);
    }

    function mint(address to, uint256 id, uint256 amount) external onlyMinter circuitBreakerCheck(this.mint.selector) {
        _mint(to, id, amount, "");
        
        transactionHistory.recordTransaction(
            to,
            address(this),
            "MINT",
            amount,
            id
        );
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) public override circuitBreakerCheck(this.safeTransferFrom.selector) {
        super.safeTransferFrom(from, to, id, value, data);
        
        transactionHistory.recordTransaction(
            from,
            address(this),
            "TRANSFER",
            value,
            id
        );
    }

    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) public override circuitBreakerCheck(this.safeBatchTransferFrom.selector) {
        super.safeBatchTransferFrom(from, to, ids, values, data);
        
        // Record batch transfer as single transaction with total value
        uint256 totalValue = 0;
        for (uint256 i = 0; i < values.length; i++) {
            totalValue += values[i];
        }
        
        transactionHistory.recordTransaction(
            from,
            address(this),
            "BATCH_TRANSFER",
            totalValue,
            ids.length
        );
    }

    function setApprovalForAll(address operator, bool approved) public override circuitBreakerCheck(this.setApprovalForAll.selector) {
        super.setApprovalForAll(operator, approved);
        
        transactionHistory.recordTransaction(
            msg.sender,
            address(this),
            approved ? "APPROVE_ALL" : "REVOKE_ALL",
            0,
            0
        );
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseTokenURI, tokenId, ".json"));
    }
}
