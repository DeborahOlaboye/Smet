// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SmetHero is ERC721 {
    // Sequential minting for simplicity and to make token IDs predictable.
    // `nextId` starts at 1 and increments on each mint.
    uint256 public nextId = 1;

    constructor() ERC721("SmetHero", "SHERO") {}

    function mint(address to) external returns (uint256 id) {
        id = nextId++;
        // Use _safeMint to ensure ERC721Receiver compliance when minting to contracts
        _safeMint(to, id);
    }
}