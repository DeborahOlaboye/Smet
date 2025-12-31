// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./InputValidator.sol";

contract SmetHero is ERC721 {
    uint256 public nextId = 1;

    constructor() ERC721("SmetHero", "SHERO") {}

    function mint(address to) external returns (uint256 id) {
        InputValidator.validateAddress(to);
        id = nextId++;
        _safeMint(to, id);
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public override {
        InputValidator.validateAddress(from);
        InputValidator.validateAddress(to);
        super.transferFrom(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        InputValidator.validateAddress(from);
        InputValidator.validateAddress(to);
        super.safeTransferFrom(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        InputValidator.validateAddress(from);
        InputValidator.validateAddress(to);
        super.safeTransferFrom(from, to, tokenId, data);
    }
    
    function approve(address to, uint256 tokenId) public override {
        InputValidator.validateAddress(to);
        super.approve(to, tokenId);
    }
}