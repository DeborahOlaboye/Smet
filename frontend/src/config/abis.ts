export const SMET_REWARD_ABI = [
  {
    "inputs": [{"internalType": "bool", "name": "payInNative", "type": "bool"}],
    "name": "open",
    "outputs": [{"internalType": "uint256", "name": "reqId", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllRewards",
    "outputs": [{"components": [{"internalType": "uint8", "name": "assetType", "type": "uint8"}, {"internalType": "address", "name": "token", "type": "address"}, {"internalType": "uint256", "name": "idOrAmount", "type": "uint256"}], "internalType": "struct Reward[]", "name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "getReward",
    "outputs": [{"components": [{"internalType": "uint8", "name": "assetType", "type": "uint8"}, {"internalType": "address", "name": "token", "type": "address"}, {"internalType": "uint256", "name": "idOrAmount", "type": "uint256"}], "internalType": "struct Reward", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRewardCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getRewardStock",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWeights",
    "outputs": [{"internalType": "uint32[]", "name": "", "type": "uint32[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "opener", "type": "address"}, {"indexed": true, "internalType": "uint256", "name": "reqId", "type": "uint256"}],
    "name": "Opened",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "opener", "type": "address"}, {"components": [{"internalType": "uint8", "name": "assetType", "type": "uint8"}, {"internalType": "address", "name": "token", "type": "address"}, {"internalType": "uint256", "name": "idOrAmount", "type": "uint256"}], "indexed": false, "internalType": "struct Reward", "name": "reward", "type": "tuple"}],
    "name": "RewardOut",
    "type": "event"
  }
] as const;