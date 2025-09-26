import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    liskSepolia: {
      type: "http", 
      url: "https://rpc.sepolia-api.lisk.com",
      chainId: 4202,
    },
  },
  etherscan: {
    apiKey: {
      "liskSepolia": "empty",
    },
    customChains: [
      {
        network: "liskSepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
    ],
  },
};

export default config;