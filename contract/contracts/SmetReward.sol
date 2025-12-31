// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "./SmetTiers.sol";

/**
 * @dev Reward descriptor used in the prize pool.
 * @param assetType Asset type: 1 = ERC20, 2 = ERC721, 3 = ERC1155.
 * @param token Token contract address.
 * @param idOrAmount Token id for NFTs or amount for fungible tokens.
 */
struct Reward {
    uint8 assetType;
    address token;
    uint256 idOrAmount;
} 

/**
 * @title SmetReward
 * @notice Provably-fair "loot box" reward contract using Chainlink VRF V2 Plus.
 * @dev Uses a cumulative distribution function (CDF) built from weights for
 * sampling. `open()` requests randomness; `fulfillRandomWords` selects and
 * delivers a prize via `_deliver` which supports ERC20/ERC721/ERC1155.
 */
contract SmetReward is 
    VRFConsumerBaseV2Plus, 
    IERC721Receiver, 
    IERC1155Receiver 
{
    /** @notice Chainlink VRF coordinator address. */
    address public immutable VRF_COORD;
    /** @notice Active key hash used for VRF requests. */
    bytes32 public immutable keyHash;
    /** @notice Chainlink subscription id used to pay for VRF. */
    uint256 public immutable subId;

    // Gas-optimized constants and immutables
    /** @notice Number of confirmations VRF should wait before responding. */
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    /** @notice Gas limit forwarded to the VRF callback. */
    uint32 public constant CALLBACK_GAS_LIMIT = 250_000;
    /** @notice Number of random words requested from VRF. */
    uint32 public constant NUM_WORDS = 3;

    /** @notice Fee to open a loot box (in native wei). */
    uint256 public immutable fee;
    /** @notice Cumulative distribution function built from initial weights. */
    uint32[] public cdf;
    /** @notice Prize pool array where each element describes a reward. */
    Reward[] public prizePool;

    /** @notice Optional tiers contract used to compute user tiers. */
    address public tiersContract;

    /** @notice Admin address (deployer) with permission to configure optional modules. */
    address public immutable admin;

    /** @notice Maps VRF request ids to the address that opened the box. */
    mapping(uint256 => address) private waiting;

    /**
     * @notice Emitted when a box is opened and a VRF request is sent.
     * @param opener The sender who opened the box.
     * @param reqId The Chainlink VRF request id.
     */
    event Opened(address indexed opener, uint256 indexed reqId);

    /**
     * @notice Emitted after a reward has been delivered.
     * @param opener The recipient of the delivered reward.
     * @param reward The Reward struct representing the delivered asset.
     */
    event RewardOut(address indexed opener, Reward reward);

    /**
     * @notice Construct SmetReward with initial configuration.
     * @dev Builds internal CDF from `_weights` and stores `_prizes` into `prizePool`.
     * @param _coordinator VRF coordinator address.
     * @param _subId Chainlink subscription id.
     * @param _keyHash Key hash for VRF requests.
     * @param _fee Fee (in wei) required to open a box.
     * @param _weights Array of weights used to build CDF (must match `_prizes` length).
     * @param _prizes Array of `Reward` structs representing prize pool.
     */
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
        admin = msg.sender;

        // Build cumulative distribution function (CDF) from weights.
        // Example: weights [10, 30, 60] -> cdf [10, 40, 100]
        // We keep the cumulative sums so we can sample a random number in [0,total)
        // and select the first index where r < cdf[index]. This implementation uses
        // `unchecked` loop increments and local length caching to reduce gas.
        uint256 acc = 0;
        uint256 len = _weights.length;
        for (uint256 i = 0; i < len; ) {
            acc += _weights[i];
            // store as uint32 to keep the original storage type
            cdf.push(uint32(acc));
            unchecked { i++; }
        }

        uint256 plen = _prizes.length;
        for (uint256 i = 0; i < plen; ) {
            Reward memory rr = _prizes[i];
            prizePool.push(rr);
            unchecked { i++; }
        }
    }

    /**
     * @notice Open a loot box by paying the configured fee and request randomness.
     * @dev The `payInNative` value is passed to Chainlink to instruct payment mode.
     * Emits an {Opened} event. Returns the Chainlink VRF request id.
     * @param payInNative When true, instruct VRF to accept native payment for gas.
     * @return reqId The Chainlink VRF request id for this open call.
     */
    function open(bool payInNative) external payable returns (uint256 reqId) {
        // Ensure caller paid exactly the configured fee for opening a box
        require(msg.value == fee, "!fee");

        // Build a VRF request object. We include `extraArgs` to indicate whether
        // Chainlink should use native payment (if payInNative is true) or LINK.
        // The request parameters use gas-optimized constants to reduce storage reads.
        VRFV2PlusClient.RandomWordsRequest memory r = VRFV2PlusClient.RandomWordsRequest({
            keyHash: keyHash,
            subId: uint256(subId),
            requestConfirmations: REQUEST_CONFIRMATIONS,
            callbackGasLimit: CALLBACK_GAS_LIMIT,
            numWords: NUM_WORDS,
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

    /**
     * @notice Set the tiers contract used to compute user tiers for optional
     * integrations. Only callable by the deployer (admin).
     */
    function setTiersContract(address _t) external {
        require(msg.sender == admin, "not admin");
        tiersContract = _t;
    }

    /**
     * @notice Helper to query the numeric tier id for a user (0 = None).
     */
    function getTierOf(address user) external view returns (uint8) {
        if (tiersContract == address(0)) return 0;
        return SmetTiers(tiersContract).getTierId(user);
    }

    /**
     * @dev Chainlink VRF callback that receives random words, selects a prize
     * using the internal CDF, delivers it to the original opener, and emits
     * the {RewardOut} event.
     * @param reqId The Chainlink VRF request id.
     * @param rnd Array of random words returned by VRF.
     */
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

        // Use binary search to find the first index whose CDF exceeds the sampled
        // value. Binary search reduces the number of storage reads from O(n) to O(log n).
        uint256 low = 0;
        uint256 high = cdf.length - 1;
        while (low < high) {
            uint256 mid = (low + high) >> 1;
            if (r < cdf[mid]) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        uint256 idx = low;

        Reward memory rw = prizePool[idx];
        _deliver(opener, rw);
        emit RewardOut(opener, rw);

        // Clean up the mapping to free storage and prevent re-use
        delete waiting[reqId];
    }

    /**
     * @dev Internal helper to deliver a selected `Reward` to `to`.
     * Supports ERC20 transfers, ERC721 safeTransferFrom, and ERC1155 single transfer.
     * @param to Recipient address.
     * @param rw Reward descriptor to deliver.
     */
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

    /**
     * @notice Refill the contract with ERC20 tokens to fund ERC20 prizes.
     * @dev Caller must `approve` this contract to spend `amount` of `token` beforehand.
     * @param token The ERC20 token to transfer in.
     * @param amount Amount of tokens to transfer into the contract.
     */
    function refill(IERC20 token, uint256 amount) external {
        require(amount > 0, "!amount");
        token.transferFrom(msg.sender, address(this), amount);
    }

    /** @notice Accept native (ETH) payments to the contract. */
    receive() external payable {}

    // ===== ERC721 & ERC1155 Receiver Support =====

    /**
     * @notice ERC721 token receiver handler required for safe transfers to this contract.
     * @return selector Magic value to accept the transfer.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        // Acknowledge ERC721 receipt; required to accept safeTransferFrom
        return IERC721Receiver.onERC721Received.selector;
    }

    /**
     * @notice ERC1155 single token receiver handler required for safe transfers to this contract.
     * @return selector Magic value to accept the transfer.
     */
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

    /**
     * @notice ERC1155 batch receiver handler required for safe transfers to this contract.
     * @return selector Magic value to accept the batch transfer.
     */
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

    /**
     * @notice Query whether a given interface is supported (ERC165).
     * @param interfaceId The interface id to check.
     * @return True if the interface is supported.
     */
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
