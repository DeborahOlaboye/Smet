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

/*
 * SmetReward
 *
 * This contract implements a provably-fair "loot box" style reward system.
 * - A weighted prize pool is provided at construction. The `weights` array
 *   is converted into a cumulative distribution function (CDF) stored in
 *   `cdf` for efficient sampling.
 * - Users call `open()` (paying the required fee) which requests random words
 *   from Chainlink VRF (via VRF V2 Plus). The randomness callback chooses a
 *   prize by taking rnd[0] modulo the total weight and finding the first CDF
 *   bucket that exceeds the random value.
 * - The contract supports ERC20/ERC721/ERC1155 reward deliveries and has
 *   straightforward refill and receiver handlers for token transfers.
 */
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

        // Build cumulative distribution function (CDF) from weights.
        // Example: weights [10, 30, 60] -> cdf [10, 40, 100]
        // We keep the cumulative sums so we can sample a random number in [0,total)
        // and select the first index where r < cdf[index]. This is O(n) but simple
        // and gas-efficient for modest prize pools.
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
        // Ensure caller paid exactly the configured fee for opening a box
        require(msg.value == fee, "!fee");

        // Build a VRF request object. We include `extraArgs` to indicate whether
        // Chainlink should use native payment (if payInNative is true) or LINK.
        // The request parameters (confirmations, gas limit, numWords) are tuned
        // to balance cost and reliability.
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

        // Send the request to the coordinator and store the request id -> opener
        // mapping so we can attribute the eventual randomness response to the
        // original caller in `fulfillRandomWords`.
        reqId = s_vrfCoordinator.requestRandomWords(r);

        waiting[reqId] = msg.sender;
        emit Opened(msg.sender, reqId);
    }

    function fulfillRandomWords(uint256 reqId, uint256[] calldata rnd) internal override {
        // Map the VRF request id back to the original opener
        address opener = waiting[reqId];
        require(opener != address(0), "no opener");

        // Sample from the CDF using the first random word. We take rnd[0] mod total
        // to reduce the random value into the range [0, total). This approach is
        // simple and efficient; for very large totals there can be negligible
        // modulo bias but for typical-weighted pools this is acceptable.
        uint256 total = cdf[cdf.length - 1];
        uint256 r = rnd[0] % total;

        // Find the first index whose CDF exceeds the sampled value. This is the
        // selected prize index.
        uint256 idx;
        for (idx = 0; idx < cdf.length; idx++) {
            if (r < cdf[idx]) break;
        }

        Reward memory rw = prizePool[idx];
        _deliver(opener, rw);
        emit RewardOut(opener, rw);

        // Clean up the mapping to free storage and prevent re-use
        delete waiting[reqId];
    }

    function _deliver(address to, Reward memory rw) private {
        // Deliver the selected reward to `to` depending on the asset type.
        // assetType: 1 = ERC20 (transfer amount), 2 = ERC721 (token id), 3 = ERC1155 (id + amount 1)
        if (rw.assetType == 1) {
            // For ERC20, transfer the specified amount (idOrAmount is used as amount)
            require(IERC20(rw.token).transfer(to, rw.idOrAmount), "erc20 transfer failed");
        } else if (rw.assetType == 2) {
            // For ERC721, perform a safeTransferFrom for the provided token id
            IERC721(rw.token).safeTransferFrom(address(this), to, rw.idOrAmount);
        } else if (rw.assetType == 3) {
            // For ERC1155, transfer a single unit of the provided id
            IERC1155(rw.token).safeTransferFrom(address(this), to, rw.idOrAmount, 1, "");
        } else {
            revert("invalid assetType");
        }
    }

    // Allows anyone to transfer ERC20 tokens into the contract to fund ERC20 prizes.
    // The caller must have approved the contract to spend `amount` of `token`.
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
        // Acknowledge ERC721 receipt; required to accept safeTransferFrom
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        // Acknowledge ERC1155 receipt; required to accept safeTransferFrom
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        // Acknowledge batch ERC1155 receipt
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
