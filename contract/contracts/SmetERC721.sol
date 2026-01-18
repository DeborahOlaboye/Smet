// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetHero is ERC721, Ownable {
    uint256 public nextId = 1;
    string private _baseTokenURI;
    address public minter;

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can call this function");
        _;
    }

    constructor(string memory baseURI) ERC721("SmetHero", "SHERO") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Invalid minter address");
        minter = _minter;
    }

    function mint(address to) external circuitBreakerCheck(this.mint.selector) returns (uint256 id) {
        id = nextId++;
        totalMinted++;
        _safeMint(to, id);
        
        transactionHistory.recordTransaction(
            to,
            address(this),
            "MINT",
            0,
            id
        );
    }

    function transferFrom(address from, address to, uint256 tokenId) public override circuitBreakerCheck(this.transferFrom.selector) {
        super.transferFrom(from, to, tokenId);
        
        transactionHistory.recordTransaction(
            from,
            address(this),
            "TRANSFER",
            0,
            tokenId
        );
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override circuitBreakerCheck(this.safeTransferFrom.selector) {
        super.safeTransferFrom(from, to, tokenId);
        
        transactionHistory.recordTransaction(
            from,
            address(this),
            "SAFE_TRANSFER",
            0,
            tokenId
        );
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override circuitBreakerCheck(this.safeTransferFrom.selector) {
        super.safeTransferFrom(from, to, tokenId, data);
        
        transactionHistory.recordTransaction(
            from,
            address(this),
            "SAFE_TRANSFER_DATA",
            0,
            tokenId
        );
    }

    function approve(address to, uint256 tokenId) public override circuitBreakerCheck(this.approve.selector) {
        super.approve(to, tokenId);
        
        transactionHistory.recordTransaction(
            msg.sender,
            address(this),
            "APPROVE",
            0,
            tokenId
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

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return string(abi.encodePacked(_baseURI(), tokenId, ".json"));
    }
}
