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
    uint256 private totalMinted = 0;

    constructor() ERC721("SmetHero", "SHERO") {
        // Formal verification: Initial state
        assert(nextId == 1);
        assert(totalMinted == 0);
    }

    /**
     * @notice Mint a new hero NFT to `to` and return the token id.
     * @param to Recipient address for the newly minted NFT.
     * @return id The token id that was minted.
     */
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
    
    function transferFrom(address from, address to, uint256 tokenId) public override {
        address previousOwner = ownerOf(tokenId);
        
        super.transferFrom(from, to, tokenId);
        
        // Formal verification: Transfer correctness
        assert(previousOwner == from);
        assert(ownerOf(tokenId) == to);
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
