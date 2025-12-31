// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SmetHero is ERC721 {
    uint256 public nextId = 1;
    uint256 private totalMinted = 0;

    constructor() ERC721("SmetHero", "SHERO") {
        // Formal verification: Initial state
        assert(nextId == 1);
        assert(totalMinted == 0);
    }

    function mint(address to) external returns (uint256 id) {
        uint256 previousNextId = nextId;
        uint256 previousTotalMinted = totalMinted;
        
        id = nextId++;
        totalMinted++;
        _safeMint(to, id);
        
        // Formal verification: Mint correctness
        assert(id == previousNextId);
        assert(nextId == previousNextId + 1);
        assert(totalMinted == previousTotalMinted + 1);
        assert(ownerOf(id) == to);
    }
}