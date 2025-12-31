// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetHero is ERC721, Pausable, Ownable {
    uint256 public nextId = 1;

    constructor() ERC721("SmetHero", "SHERO") Ownable(msg.sender) {}

    function mint(address to) external returns (uint256 id) {
        id = nextId++;
        _safeMint(to, id);
    }
}