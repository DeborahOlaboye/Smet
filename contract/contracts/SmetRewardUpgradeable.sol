// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

struct Reward {
    uint8 assetType;
    address token;
    uint256 idOrAmount;
}

contract SmetRewardUpgradeable is 
    Initializable,
    VRFConsumerBaseV2Plus,
    IERC721ReceiverUpgradeable,
    IERC1155ReceiverUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    address public VRF_COORD;
    bytes32 public keyHash;
    uint256 public subId;

    uint16 public requestConfirmations;
    uint32 public callbackGasLimit;
    uint32 public numWords;

    uint256 public fee;
    uint32[] public cdf;
    Reward[] public prizePool;

    mapping(uint256 => address) private waiting;
    address public timelock;

    event Opened(address indexed opener, uint256 indexed reqId);
    event RewardOut(address indexed opener, Reward reward);
    event TimelockSet(address indexed timelock);
    event FeeUpdated(uint256 oldFee, uint256 newFee);

    modifier onlyTimelock() {
        require(msg.sender == timelock, "Only timelock");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _coordinator) VRFConsumerBaseV2Plus(_coordinator) {
        _disableInitializers();
    }

    function initialize(
        address _coordinator,
        uint256 _subId,
        bytes32 _keyHash,
        uint256 _fee,
        uint32[] memory _weights,
        Reward[] memory _prizes
    ) public initializer {
        require(_weights.length == _prizes.length && _weights.length > 0, "len mismatch");
        
        __Ownable_init(msg.sender);
        __Pausable_init();
        __UUPSUpgradeable_init();

        VRF_COORD = _coordinator;
        subId = _subId;
        keyHash = _keyHash;
        fee = _fee;
        requestConfirmations = 3;
        callbackGasLimit = 250_000;
        numWords = 3;

        uint32 acc = 0;
        for (uint i = 0; i < _weights.length; i++) {
            acc += _weights[i];
            cdf.push(acc);
        }

        for (uint i = 0; i < _prizes.length; i++) {
            prizePool.push(_prizes[i]);
        }
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function open(bool payInNative) external payable whenNotPaused returns (uint256 reqId) {
        require(msg.value == fee, "!fee");

        VRFV2PlusClient.RandomWordsRequest memory r = VRFV2PlusClient.RandomWordsRequest({
            keyHash: keyHash,
            subId: subId,
            requestConfirmations: requestConfirmations,
            callbackGasLimit: callbackGasLimit,
            numWords: numWords,
            extraArgs: VRFV2PlusClient._argsToBytes(
                VRFV2PlusClient.ExtraArgsV1({ nativePayment: payInNative })
            )
        });

        reqId = s_vrfCoordinator.requestRandomWords(r);
        waiting[reqId] = msg.sender;
        emit Opened(msg.sender, reqId);
    }

    function fulfillRandomWords(uint256 reqId, uint256[] calldata rnd) internal override {
        address opener = waiting[reqId];
        require(opener != address(0), "no opener");

        uint256 total = cdf[cdf.length - 1];
        uint256 r = rnd[0] % total;

        uint256 idx;
        for (idx = 0; idx < cdf.length; idx++) {
            if (r < cdf[idx]) break;
        }

        Reward memory rw = prizePool[idx];
        delete waiting[reqId];
        
        _deliver(opener, rw);
        emit RewardOut(opener, rw);
    }

    function _deliver(address to, Reward memory rw) private {
        if (rw.assetType == 1) {
            require(IERC20(rw.token).transfer(to, rw.idOrAmount), "erc20 transfer failed");
        } else if (rw.assetType == 2) {
            IERC721(rw.token).safeTransferFrom(address(this), to, rw.idOrAmount);
        } else if (rw.assetType == 3) {
            IERC1155(rw.token).safeTransferFrom(address(this), to, rw.idOrAmount, 1, "");
        } else {
            revert("invalid assetType");
        }
    }

    function setTimelock(address _timelock) external onlyOwner {
        timelock = _timelock;
        emit TimelockSet(_timelock);
    }

    function updateFee(uint256 newFee) external onlyTimelock {
        uint256 oldFee = fee;
        fee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function refill(IERC20 token, uint256 amount) external whenNotPaused {
        require(amount > 0, "!amount");
        token.transferFrom(msg.sender, address(this), amount);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721ReceiverUpgradeable.onERC721Received.selector;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC1155ReceiverUpgradeable.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) external pure override returns (bytes4) {
        return IERC1155ReceiverUpgradeable.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view override(IERC165Upgradeable) returns (bool) {
        return interfaceId == type(IERC721ReceiverUpgradeable).interfaceId ||
               interfaceId == type(IERC1155ReceiverUpgradeable).interfaceId ||
               super.supportsInterface(interfaceId);
    }

    receive() external payable {}
}