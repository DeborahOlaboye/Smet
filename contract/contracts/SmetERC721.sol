// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./CircuitBreaker.sol";

contract SmetHero is ERC721, CircuitBreaker {
    uint256 public nextId = 1;

    constructor() ERC721("SmetHero", "SHERO") {}

    function mint(address to) external circuitBreakerCheck(this.mint.selector) returns (uint256 id) {
        id = nextId++;
        _safeMint(to, id);
    }

    function transferFrom(address from, address to, uint256 tokenId) public override circuitBreakerCheck(this.transferFrom.selector) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override circuitBreakerCheck(this.safeTransferFrom.selector) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override circuitBreakerCheck(this.safeTransferFrom.selector) {
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function approve(address to, uint256 tokenId) public override circuitBreakerCheck(this.approve.selector) {
        super.approve(to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public override circuitBreakerCheck(this.setApprovalForAll.selector) {
        super.setApprovalForAll(operator, approved);
    }
}