// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmetHero is ERC721, Pausable, Ownable {
    uint256 public nextId = 1;
    address public emergencyRecovery;
    
    event EmergencyRecoverySet(address indexed recovery);

    constructor() ERC721("SmetHero", "SHERO") Ownable(msg.sender) {}

    function mint(address to) external whenNotPaused returns (uint256 id) {
        id = nextId++;
        _safeMint(to, id);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function setEmergencyRecovery(address _emergencyRecovery) external onlyOwner {
        emergencyRecovery = _emergencyRecovery;
        emit EmergencyRecoverySet(_emergencyRecovery);
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public override whenNotPaused {
        super.transferFrom(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public override whenNotPaused {
        super.safeTransferFrom(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override whenNotPaused {
        super.safeTransferFrom(from, to, tokenId, data);
    }
}