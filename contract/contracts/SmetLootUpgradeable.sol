// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract SmetLootUpgradeable is 
    Initializable,
    ERC1155Upgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    address public timelock;

    event TimelockSet(address indexed timelock);
    event LootMinted(address indexed to, uint256 indexed id, uint256 amount);
    event URIUpdated(string newURI);

    modifier onlyTimelock() {
        require(msg.sender == timelock, "Only timelock");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC1155_init("https://loot.example/{id}.json");
        __Ownable_init(msg.sender);
        __Pausable_init();
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

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

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override whenNotPaused {
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public override whenNotPaused {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }
}