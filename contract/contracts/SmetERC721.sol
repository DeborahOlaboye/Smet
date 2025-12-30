// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title SmetHero
 * @notice Simple ERC721 used for hero NFTs in the game.
 * @dev Uses sequential minting to keep token IDs predictable.
 */
contract SmetHero is ERC721 {
    /** @notice The next token id to be minted. Starts at 1. */
    uint256 public nextId = 1;

    /** @notice Deploy the SmetHero ERC721 contract. */
    constructor() ERC721("SmetHero", "SHERO") {}

    /**
     * @notice Mint a new hero NFT to `to` and return the token id.
     * @param to Recipient address for the newly minted NFT.
     * @return id The token id that was minted.
     */
    function mint(address to) external returns (uint256 id) {
        id = nextId++;
        // Use _safeMint to ensure ERC721Receiver compliance when minting to contracts
        _safeMint(to, id);
    }
} 