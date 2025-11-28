// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

struct Reward {
    uint8 assetType;
    address token;
    uint256 idOrAmount;
}

contract SmetReward is 
    VRFConsumerBaseV2Plus, 
    IERC721Receiver, 
    IERC1155Receiver 
{
    address public immutable VRF_COORD;
    bytes32 public immutable keyHash;
    uint256 public immutable subId;

    uint16 public requestConfirmations = 3;
    uint32 public callbackGasLimit = 250_000;
    uint32 public numWords = 3;

    uint256 public fee;
    uint32[] public cdf;
    Reward[] public prizePool;

    mapping(uint256 => address) private waiting;

    event Opened(address indexed opener, uint256 indexed reqId);
    event RewardOut(address indexed opener, Reward reward);

    constructor(
        address _coordinator,
        uint256  _subId,
        bytes32 _keyHash,
        uint256 _fee,
        uint32[] memory _weights,
        Reward[] memory _prizes
    ) VRFConsumerBaseV2Plus(_coordinator) {
        require(_weights.length == _prizes.length && _weights.length > 0, "len mismatch");
        VRF_COORD = _coordinator;
        subId = _subId;
        keyHash = _keyHash;
        fee = _fee;

        uint32 acc = 0;
        for (uint i = 0; i < _weights.length; i++) {
            acc += _weights[i];
            cdf.push(acc);
        }

        for (uint i = 0; i < _prizes.length; i++) {
            Reward memory r = _prizes[i];
            prizePool.push(Reward({
                assetType: r.assetType,
                token: r.token,
                idOrAmount: r.idOrAmount
            }));
        }
    }

    function open(bool payInNative) external payable returns (uint256 reqId) {
        require(msg.value == fee, "!fee");

        VRFV2PlusClient.RandomWordsRequest memory r = VRFV2PlusClient.RandomWordsRequest({
            keyHash: keyHash,
            subId: uint256(subId),
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
        _deliver(opener, rw);
        emit RewardOut(opener, rw);

        delete waiting[reqId];
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

    function refill(IERC20 token, uint256 amount) external {
        require(amount > 0, "!amount");
        token.transferFrom(msg.sender, address(this), amount);
    }

    receive() external payable {}

    // ===== ERC721 & ERC1155 Receiver Support =====

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        pure
        override
        returns (bool)
    {
        return interfaceId == type(IERC1155Receiver).interfaceId ||
               interfaceId == type(IERC721Receiver).interfaceId;
    }
}
