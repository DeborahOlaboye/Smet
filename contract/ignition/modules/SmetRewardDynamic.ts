import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SmetRewardDynamicModule = buildModule("SmetRewardDynamicModule", (m) => {
  // Deploy token contracts first
  const smetGold = m.contract("SmetGold");
  const smetHero = m.contract("SmetHero", ["https://api.smet.com/heroes/"]);
  const smetLoot = m.contract("SmetLoot", ["https://api.smet.com/loot/"]);

  // VRF Configuration for Lisk Sepolia
  const vrfCoordinator = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";
  const subscriptionId = 1;
  const keyHash = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
  const fee = m.getParameter("fee", "10000000000000000"); // 0.01 ETH

  // Initial reward configuration - minimal setup for dynamic management
  const initialWeights = [100];
  const initialPrizes = [
    {
      assetType: 1,
      token: smetGold,
      idOrAmount: "100000000000000000000" // 100 tokens
    }
  ];

  // Deploy main reward contract with dynamic management
  const smetReward = m.contract("SmetReward", [
    vrfCoordinator,
    subscriptionId,
    keyHash,
    fee,
    initialWeights,
    initialPrizes
  ]);

  // Setup initial token transfers
  m.call(smetGold, "transfer", [smetReward, "5000000000000000000000"]); // 5000 tokens
  
  // Mint initial NFTs to reward contract
  m.call(smetHero, "mint", [smetReward]);
  m.call(smetHero, "mint", [smetReward]);
  m.call(smetHero, "mint", [smetReward]);
  
  // Mint initial loot items
  m.call(smetLoot, "mint", [smetReward, 77, 100]);
  m.call(smetLoot, "mint", [smetReward, 88, 50]);

  return {
    smetGold,
    smetHero,
    smetLoot,
    smetReward
  };
});

export default SmetRewardDynamicModule;