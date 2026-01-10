// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract SmetHeroUpgradeable is 
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    uint256 public nextId;
    address public timelock;

    event TimelockSet(address indexed timelock);
    event HeroMinted(address indexed to, uint256 indexed tokenId);

    modifier onlyTimelock() {
        require(msg.sender == timelock, "Only timelock");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("SmetHero", "SHERO");
        __Ownable_init(msg.sender);
        __Pausable_init();
        __UUPSUpgradeable_init();

        nextId = 1;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function setTimelock(address _timelock) external onlyOwner {
        timelock = _timelock;
        emit TimelockSet(_timelock);
    }

    function mint(address to) external onlyTimelock returns (uint256 id) {
        id = nextId++;
        _safeMint(to, id);
        emit HeroMinted(to, id);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
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