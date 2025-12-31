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
    
    event BatchMintCompleted(address indexed minter, uint256 count);
    event BatchTransferCompleted(address indexed sender, uint256 count);

    /** @notice Deploy the SmetHero ERC721 contract. */
    constructor() ERC721("SmetHero", "SHERO") {}

    /**
     * @notice Mint a new hero NFT to `to` and return the token id.
     * @param to Recipient address for the newly minted NFT.
     * @return id The token id that was minted.
     */
    function mint(address to) external returns (uint256 id) {
        id = nextId;
        // Use unchecked increment to save a small amount of gas on the common path
        unchecked { nextId = id + 1; }
        // Use _safeMint to ensure ERC721Receiver compliance when minting to contracts
        _safeMint(to, id);
    }

    function batchMint(address[] calldata recipients) external returns (uint256[] memory ids) {
        ids = new uint256[](recipients.length);
        for (uint256 i = 0; i < recipients.length; i++) {
            ids[i] = nextId++;
            _safeMint(recipients[i], ids[i]);
        }
        emit BatchMintCompleted(msg.sender, recipients.length);
    }

    function batchTransfer(address[] calldata to, uint256[] calldata tokenIds) external {
        require(to.length == tokenIds.length, "Length mismatch");
        for (uint256 i = 0; i < to.length; i++) {
            safeTransferFrom(msg.sender, to[i], tokenIds[i]);
        }
        emit BatchTransferCompleted(msg.sender, to.length);
    }

    function batchApprove(address[] calldata spenders, uint256[] calldata tokenIds) external {
        require(spenders.length == tokenIds.length, "Length mismatch");
        for (uint256 i = 0; i < spenders.length; i++) {
            approve(spenders[i], tokenIds[i]);
        }
    }
}
