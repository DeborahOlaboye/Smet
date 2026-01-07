import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UpgradeableModule = buildModule("UpgradeableModule", (m) => {
  // VRF Configuration parameters
  const vrfCoordinator = m.getParameter("vrfCoordinator", "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2");
  const keyHash = m.getParameter("keyHash", "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899");
  const subscriptionId = m.getParameter("subscriptionId", 1);
  const fee = m.getParameter("fee", "10000000000000000"); // 0.01 ETH

  // Sample prize configuration
  const weights = [50, 30, 15, 5];
  const prizes = [
    { assetType: 1, token: "0x0000000000000000000000000000000000000000", idOrAmount: "10000000000000000000" },
    { assetType: 1, token: "0x0000000000000000000000000000000000000000", idOrAmount: "50000000000000000000" },
    { assetType: 1, token: "0x0000000000000000000000000000000000000000", idOrAmount: "100000000000000000000" },
    { assetType: 1, token: "0x0000000000000000000000000000000000000000", idOrAmount: "500000000000000000000" }
  ];

  // Deploy SmetGold Upgradeable
  const smetGoldProxy = m.contract("SmetGoldUpgradeable", [], {
    id: "SmetGoldProxy"
  });

  // Deploy SmetHero Upgradeable  
  const smetHeroProxy = m.contract("SmetHeroUpgradeable", [], {
    id: "SmetHeroProxy"
  });

  // Deploy SmetLoot Upgradeable
  const smetLootProxy = m.contract("SmetLootUpgradeable", [], {
    id: "SmetLootProxy"
  });

  // Deploy SmetReward Upgradeable
  const smetRewardProxy = m.contract("SmetRewardUpgradeable", [vrfCoordinator], {
    id: "SmetRewardProxy"
  });

  return {
    smetGoldProxy,
    smetHeroProxy,
    smetLootProxy,
    smetRewardProxy,
  };
});

export default UpgradeableModule;