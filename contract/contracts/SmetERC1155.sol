// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetLoot is ERC1155, Ownable {
    address public timelock;
    
    modifier onlyTimelock() {
        require(msg.sender == timelock, "Only timelock");
        _;
    }
    
    event TimelockSet(address indexed timelock);
    event LootMinted(address indexed to, uint256 indexed id, uint256 amount);
    event URIUpdated(string newURI);
    
    constructor() ERC1155("https://loot.example/{id}.json") Ownable(msg.sender) {}
    
    function setTimelock(address _timelock) external onlyOwner {
        timelock = _timelock;
        emit TimelockSet(_timelock);
    }

    function mint(address to, uint256 id, uint256 amount) external onlyTimelock {
        _mint(to, id, amount, "");
        emit LootMinted(to, id, amount);
    }
    
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) external onlyTimelock {
        _mintBatch(to, ids, amounts, "");
    }
    
    function setURI(string memory newURI) external onlyTimelock {
        _setURI(newURI);
        emit URIUpdated(newURI);
    }
}