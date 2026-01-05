// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
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
    IERC1155Receiver,
    Ownable,
    Pausable 
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
    event RewardAdded(uint256 indexed index, Reward reward, uint32 weight);
    event RewardRemoved(uint256 indexed index);
    event RewardUpdated(uint256 indexed index, Reward reward, uint32 weight);
    event WeightsUpdated();
    event FeeUpdated(uint256 newFee);

    constructor(
        address _coordinator,
        uint256  _subId,
        bytes32 _keyHash,
        uint256 _fee,
        uint32[] memory _weights,
        Reward[] memory _prizes
    ) VRFConsumerBaseV2Plus(_coordinator) Ownable(msg.sender) {
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

    function open(bool payInNative) external payable whenNotPaused returns (uint256 reqId) {
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

    // ===== DYNAMIC REWARD POOL MANAGEMENT =====

    function addReward(Reward memory reward, uint32 weight) external onlyOwner {
        require(weight > 0, "!weight");
        require(reward.assetType >= 1 && reward.assetType <= 3, "invalid assetType");
        
        prizePool.push(reward);
        
        if (cdf.length == 0) {
            cdf.push(weight);
        } else {
            cdf.push(cdf[cdf.length - 1] + weight);
        }
        
        emit RewardAdded(prizePool.length - 1, reward, weight);
    }

    function removeReward(uint256 index) external onlyOwner {
        require(index < prizePool.length, "invalid index");
        
        // Remove from prize pool
        for (uint i = index; i < prizePool.length - 1; i++) {
            prizePool[i] = prizePool[i + 1];
        }
        prizePool.pop();
        
        emit RewardRemoved(index);
        
        // Rebuild CDF if rewards remain
        if (prizePool.length > 0) {
            _rebuildCDF();
        } else {
            delete cdf;
        }
    }

    function updateReward(uint256 index, Reward memory reward, uint32 weight) external onlyOwner {
        require(index < prizePool.length, "invalid index");
        require(weight > 0, "!weight");
        require(reward.assetType >= 1 && reward.assetType <= 3, "invalid assetType");
        
        prizePool[index] = reward;
        emit RewardUpdated(index, reward, weight);
        
        _rebuildCDF();
    }

    function updateWeights(uint32[] memory weights) external onlyOwner {
        require(weights.length == prizePool.length, "len mismatch");
        require(weights.length > 0, "empty weights");
        
        delete cdf;
        uint32 acc = 0;
        for (uint i = 0; i < weights.length; i++) {
            require(weights[i] > 0, "!weight");
            acc += weights[i];
            cdf.push(acc);
        }
        
        emit WeightsUpdated();
    }

    function updateFee(uint256 newFee) external onlyOwner {
        fee = newFee;
        emit FeeUpdated(newFee);
    }

    function _rebuildCDF() private {
        // This function requires external call to updateWeights with current weights
        // or manual weight management by admin
    }

    // ===== VIEW FUNCTIONS =====

    function getRewardCount() external view returns (uint256) {
        return prizePool.length;
    }

    function getReward(uint256 index) external view returns (Reward memory) {
        require(index < prizePool.length, "invalid index");
        return prizePool[index];
    }

    function getAllRewards() external view returns (Reward[] memory) {
        return prizePool;
    }

    function getWeights() external view returns (uint32[] memory) {
        return cdf;
    }

    // ===== BATCH OPERATIONS =====

    function addRewardsBatch(Reward[] memory rewards, uint32[] memory weights) external onlyOwner {
        require(rewards.length == weights.length, "len mismatch");
        require(rewards.length > 0, "empty arrays");
        
        for (uint i = 0; i < rewards.length; i++) {
            require(weights[i] > 0, "!weight");
            require(rewards[i].assetType >= 1 && rewards[i].assetType <= 3, "invalid assetType");
            
            prizePool.push(rewards[i]);
            
            if (cdf.length == 0) {
                cdf.push(weights[i]);
            } else {
                cdf.push(cdf[cdf.length - 1] + weights[i]);
            }
            
            emit RewardAdded(prizePool.length - 1, rewards[i], weights[i]);
        }
    }

    function removeRewardsBatch(uint256[] memory indices) external onlyOwner {
        require(indices.length > 0, "empty indices");
        
        // Sort indices in descending order to avoid index shifting issues
        for (uint i = 0; i < indices.length - 1; i++) {
            for (uint j = i + 1; j < indices.length; j++) {
                if (indices[i] < indices[j]) {
                    uint256 temp = indices[i];
                    indices[i] = indices[j];
                    indices[j] = temp;
                }
            }
        }
        
        // Remove rewards in descending order
        for (uint i = 0; i < indices.length; i++) {
            require(indices[i] < prizePool.length, "invalid index");
            
            for (uint j = indices[i]; j < prizePool.length - 1; j++) {
                prizePool[j] = prizePool[j + 1];
            }
            prizePool.pop();
            
            emit RewardRemoved(indices[i]);
        }
        
        // Rebuild CDF if rewards remain
        if (prizePool.length > 0) {
            _rebuildCDF();
        } else {
            delete cdf;
        }
    }

    // ===== EMERGENCY CONTROLS =====

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }

    function emergencyWithdrawNFT(address token, uint256 tokenId) external onlyOwner {
        IERC721(token).safeTransferFrom(address(this), owner(), tokenId);
    }

    function emergencyWithdraw1155(address token, uint256 tokenId, uint256 amount) external onlyOwner {
        IERC1155(token).safeTransferFrom(address(this), owner(), tokenId, amount, "");
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
