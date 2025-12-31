// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Reward descriptor used in the prize pool.
 * @param assetType Asset type: 1 = ERC20, 2 = ERC721, 3 = ERC1155.
 * @param token Token contract address.
 * @param idOrAmount Token id for NFTs or amount for fungible tokens.
 * @param availableAfter Unix timestamp when this reward becomes claimable (0 = immediately).
 */
struct Reward {
    uint8 assetType;
    address token;
    uint256 idOrAmount;
    uint64 availableAfter;
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
    IERC1155Receiver,
    Pausable,
    Ownable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
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
    uint256 private totalRewardsDistributed = 0;

    // ===== Multi-pool support =====
    /** @notice Per-pool cumulative distribution functions (CDF) built from weights. */
    mapping(uint256 => uint32[]) public cdfPerPool;
    /** @notice Per-pool prize arrays. */
    mapping(uint256 => Reward[]) public prizePoolPerPool;
    /** @notice Per-pool fee (native payment required when opening a pool). */
    mapping(uint256 => uint256) public poolFee;
    /** @notice Count of pools created (0-based ids). */
    uint256 public poolCount;

    /** @notice Optional tiers contract used to compute user tiers. */
    address public tiersContract;

    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    mapping(uint256 => address) private waiting;
    address public emergencyRecovery;
    
    event EmergencyRecoverySet(address indexed recovery);
    event EmergencyWithdrawal(address indexed token, uint256 amount, address indexed recipient);

    /**
     * @notice Emitted after a reward has been delivered.
     * @param opener The recipient of the delivered reward.
     * @param reward The Reward struct representing the delivered asset.
     */
    event RewardOut(address indexed opener, Reward reward);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event PrizeAdded(uint256 indexed prizeIndex, Reward reward, uint32 weight);
    event VRFConfigUpdated(uint16 requestConfirmations, uint32 callbackGasLimit, uint32 numWords);

    /** @notice Emitted when a pool's configuration changes. */
    event PoolUpdated(uint256 indexed poolId);
    /** @notice Maps VRF request ids to the address that opened the box. */
    mapping(uint256 => address) private waiting;
    /** @notice Maps VRF request ids to the pool id that was opened. */
    mapping(uint256 => uint256) private waitingPool;

    /** @notice Per-user timestamp of last open to enforce cooldowns. */
    mapping(address => uint256) public lastOpened;
    constructor(
        address _coordinator,
        uint256  _subId,
        bytes32 _keyHash,
        uint256 _fee,
        uint256 _cooldownSeconds,
        uint32[] memory _weights,
        Reward[] memory _prizes
    ) VRFConsumerBaseV2Plus(_coordinator) Ownable(msg.sender) {
        require(_weights.length == _prizes.length && _weights.length > 0, "len mismatch");
        
        owner = msg.sender;
        
        VRF_COORD = _coordinator;
        subId = _subId;
        keyHash = _keyHash;
        fee = _fee;
        admin = msg.sender;
        // initialize cooldown (seconds)
        cooldownSeconds = _cooldownSeconds;

        // Create default pool (id 0) using the provided fee, weights and prizes
        uint256 pid = _createPool(_fee, _weights, _prizes);
        require(pid == 0, "default pid");
    }

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

    function open(bool payInNative) external payable whenNotPaused returns (uint256 reqId) {
        require(msg.value == fee, "!fee");
        
        // Formal verification: Pre-conditions
        assert(msg.value == fee);
        assert(prizePool.length > 0);

        // Enforce global cooldown per user to prevent reward farming
        if (cooldownSeconds > 0) {
            require(block.timestamp >= lastOpened[msg.sender] + cooldownSeconds, "cooldown");
        }
        // Record the time of this open immediately so delayed fulfillment cannot be farmed
        lastOpened[msg.sender] = block.timestamp;

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
        
        // Formal verification: Post-conditions
        assert(waiting[reqId] == msg.sender);
        
        emit Opened(msg.sender, reqId);
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function fulfillRandomWords(uint256 reqId, uint256[] calldata rnd) internal override {
        // Map the VRF request id back to the original opener and pool
        address opener = waiting[reqId];
        require(opener != address(0), "no opener");
        require(!delivered[reqId], "already delivered");

        // Sample from the CDF of the selected pool using the first random word.
        uint32[] storage cdf = cdfPerPool[pid];
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
        
        // Formal verification: Index bounds
        assert(idx < prizePool.length);

        Reward memory rw = prizePool[idx];
        
        // Mark as delivered and clear waiting before external calls
        delivered[reqId] = true;
        delete waiting[reqId];
        
        _deliver(opener, rw);
        totalRewardsDistributed++;
        
        // Formal verification: Post-conditions
        assert(totalRewardsDistributed == previousRewardsDistributed + 1);
        
        emit RewardOut(opener, rw);
    }

    /**
     * @dev Internal helper to deliver a selected `Reward` to `to`.
     * Supports ERC20 transfers, ERC721 safeTransferFrom, and ERC1155 single transfer.
     * @param to Recipient address.
     * @param rw Reward descriptor to deliver.
     */
    function _deliver(address to, Reward memory rw) private {
        // Formal verification: Pre-conditions
        assert(to != address(0));
        assert(rw.assetType >= 1 && rw.assetType <= 3);
        
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
        
        emit RewardDistributed(to, rw.assetType, rw.token, rw.idOrAmount);
    }

    function refill(IERC20 token, uint256 amount) external whenNotPaused {
        require(amount > 0, "!amount");
        
        // Formal verification: Pre-conditions
        assert(amount > 0);
        assert(address(token) != address(0));
        
        uint256 contractBalanceBefore = token.balanceOf(address(this));
        
        token.transferFrom(msg.sender, address(this), amount);
        emit TokenRefilled(address(token), amount, msg.sender);
    }
    
    function updateFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = fee;
        fee = newFee;
        emit FeeUpdated(oldFee, newFee, msg.sender);
    }
    
    function updateVRFConfig(uint16 _requestConfirmations, uint32 _callbackGasLimit, uint32 _numWords) external onlyOwner {
        requestConfirmations = _requestConfirmations;
        callbackGasLimit = _callbackGasLimit;
        numWords = _numWords;
        emit VRFConfigUpdated(_requestConfirmations, _callbackGasLimit, _numWords, msg.sender);
    }
    
    function transferOwnership(address newOwner) public override onlyOwner {
        address oldOwner = owner();
        super.transferOwnership(newOwner);
        emit OwnershipTransferInitiated(oldOwner, newOwner);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }
        emit EmergencyWithdrawal(token, amount, msg.sender, msg.sender);
    }
    
    function updateFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        fee = newFee;
    }
    
    function updateVRFConfig(uint16 _requestConfirmations, uint32 _callbackGasLimit, uint32 _numWords) external onlyRole(ADMIN_ROLE) {
        requestConfirmations = _requestConfirmations;
        callbackGasLimit = _callbackGasLimit;
        numWords = _numWords;
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }
    }
    
    function grantOperatorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(OPERATOR_ROLE, account);
    }
    
    function revokeOperatorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(OPERATOR_ROLE, account);
    }
    
    function grantAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, account);
    }
    
    function revokeAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, account);
    }
    
    function updatePrizePool(uint256 index, Reward memory newReward) external onlyRole(ADMIN_ROLE) {
        require(index < prizePool.length, "Invalid index");
        prizePool[index] = newReward;
    }
    
    function addPrize(Reward memory newReward, uint32 weight) external onlyRole(ADMIN_ROLE) {
        prizePool.push(newReward);
        uint32 lastCdf = cdf.length > 0 ? cdf[cdf.length - 1] : 0;
        cdf.push(lastCdf + weight);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner nonReentrant {
        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }
    }
    
    function updateFee(uint256 newFee) external onlyOwner nonReentrant {
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
    
    function updateVRFConfig(uint16 _requestConfirmations, uint32 _callbackGasLimit, uint32 _numWords) external onlyOwner nonReentrant {
        requestConfirmations = _requestConfirmations;
        callbackGasLimit = _callbackGasLimit;
        numWords = _numWords;
        emit VRFConfigUpdated(_requestConfirmations, _callbackGasLimit, _numWords);
    }
    
    function addPrize(Reward memory newReward, uint32 weight) external onlyOwner nonReentrant {
        uint256 prizeIndex = prizePool.length;
        prizePool.push(newReward);
        uint32 lastCdf = cdf.length > 0 ? cdf[cdf.length - 1] : 0;
        cdf.push(lastCdf + weight);
        emit PrizeAdded(prizeIndex, newReward, weight);
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
    
    function emergencyWithdraw(address token, uint256 amount) external {
        require(msg.sender == owner() || msg.sender == emergencyRecovery, "Unauthorized");
        
        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }
        
        emit EmergencyWithdrawal(token, amount, msg.sender);
    }

    receive() external payable nonReentrant {}

    /**
     * @notice Helper to query the number of prizes in the pool.
     */
    function prizePoolLength() external view returns (uint256) {
        return prizePool.length;
    }

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
        view
        override(AccessControl)
        returns (bool)
    {
        return interfaceId == type(IERC1155Receiver).interfaceId ||
               interfaceId == type(IERC721Receiver).interfaceId ||
               super.supportsInterface(interfaceId);
    }
}
