// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetHero is ERC721, Ownable {
    uint256 public nextId = 1;
    string private _baseTokenURI;

    constructor(string memory baseURI) ERC721("SmetHero", "SHERO") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    function mint(address to) external returns (uint256 id) {
        id = nextId++;
        _safeMint(to, id);
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