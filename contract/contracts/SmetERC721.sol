// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetHero is ERC721, Ownable {
    uint256 public nextId = 1;
    address public timelock;
    
    modifier onlyTimelock() {
        require(msg.sender == timelock, "Only timelock");
        _;
    }
    
    event TimelockSet(address indexed timelock);
    event HeroMinted(address indexed to, uint256 indexed tokenId);

    constructor() ERC721("SmetHero", "SHERO") Ownable(msg.sender) {}
    
    function setTimelock(address _timelock) external onlyOwner {
        timelock = _timelock;
        emit TimelockSet(_timelock);
    }

    function mint(address to) external onlyTimelock returns (uint256 id) {
        id = nextId++;
        _safeMint(to, id);
        emit HeroMinted(to, id);
    }
    
    function setBaseURI(string memory baseURI) external onlyTimelock {
        // Implementation would depend on having a base URI storage variable
    }
}