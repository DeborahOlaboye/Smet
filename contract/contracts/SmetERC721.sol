// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SmetHero is ERC721 {
    uint256 public nextId = 1;

    constructor() ERC721("SmetHero", "SHERO") {}

    function mint(address to) external returns (uint256 id) {
        id = nextId++;
        _safeMint(to, id);
    }

    function batchMint(address[] calldata recipients) external returns (uint256[] memory ids) {
        ids = new uint256[](recipients.length);
        for (uint256 i = 0; i < recipients.length; i++) {
            ids[i] = nextId++;
            _safeMint(recipients[i], ids[i]);
        }
    }

    function batchTransfer(address[] calldata to, uint256[] calldata tokenIds) external {
        require(to.length == tokenIds.length, "Length mismatch");
        for (uint256 i = 0; i < to.length; i++) {
            safeTransferFrom(msg.sender, to[i], tokenIds[i]);
        }
    }
}