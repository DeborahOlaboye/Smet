import { ethers, upgrades } from "hardhat";

async function deployUpgradeableContracts() {
  console.log("🚀 Deploying Upgradeable Smet Gaming Ecosystem...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // VRF Configuration (update with actual values)
  const VRF_COORDINATOR = "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2";
  const KEY_HASH = "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899";
  const SUBSCRIPTION_ID = 1;
  const FEE = ethers.parseEther("0.01");

  // Sample prize configuration
  const weights = [50, 30, 15, 5]; // 50%, 30%, 15%, 5%
  const prizes = [
    { assetType: 1, token: ethers.ZeroAddress, idOrAmount: ethers.parseEther("10") },
    { assetType: 1, token: ethers.ZeroAddress, idOrAmount: ethers.parseEther("50") },
    { assetType: 1, token: ethers.ZeroAddress, idOrAmount: ethers.parseEther("100") },
    { assetType: 1, token: ethers.ZeroAddress, idOrAmount: ethers.parseEther("500") }
  ];

  try {
    // Deploy SmetGold
    console.log("Deploying SmetGold...");
    const SmetGold = await ethers.getContractFactory("SmetGoldUpgradeable");
    const smetGold = await upgrades.deployProxy(SmetGold, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await smetGold.waitForDeployment();
    console.log("✅ SmetGold deployed to:", await smetGold.getAddress());

    // Deploy SmetHero
    console.log("Deploying SmetHero...");
    const SmetHero = await ethers.getContractFactory("SmetHeroUpgradeable");
    const smetHero = await upgrades.deployProxy(SmetHero, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await smetHero.waitForDeployment();
    console.log("✅ SmetHero deployed to:", await smetHero.getAddress());

    // Deploy SmetLoot
    console.log("Deploying SmetLoot...");
    const SmetLoot = await ethers.getContractFactory("SmetLootUpgradeable");
    const smetLoot = await upgrades.deployProxy(SmetLoot, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await smetLoot.waitForDeployment();
    console.log("✅ SmetLoot deployed to:", await smetLoot.getAddress());

    // Update prizes to use actual token addresses
    const updatedPrizes = [
      { assetType: 1, token: await smetGold.getAddress(), idOrAmount: ethers.parseEther("10") },
      { assetType: 2, token: await smetHero.getAddress(), idOrAmount: 1 },
      { assetType: 3, token: await smetLoot.getAddress(), idOrAmount: 1 },
      { assetType: 1, token: await smetGold.getAddress(), idOrAmount: ethers.parseEther("100") }
    ];

    // Deploy SmetReward
    console.log("Deploying SmetReward...");
    const SmetReward = await ethers.getContractFactory("SmetRewardUpgradeable");
    const smetReward = await upgrades.deployProxy(
      SmetReward,
      [VRF_COORDINATOR, SUBSCRIPTION_ID, KEY_HASH, FEE, weights, updatedPrizes],
      {
        initializer: "initialize",
        kind: "uups",
        constructorArgs: [VRF_COORDINATOR]
      }
    );
    await smetReward.waitForDeployment();
    console.log("✅ SmetReward deployed to:", await smetReward.getAddress());

    // Summary
    console.log("\n🎉 Deployment Complete!");
    console.log("📋 Contract Addresses:");
    console.log("SmetGold:", await smetGold.getAddress());
    console.log("SmetHero:", await smetHero.getAddress());
    console.log("SmetLoot:", await smetLoot.getAddress());
    console.log("SmetReward:", await smetReward.getAddress());

    return {
      smetGold: await smetGold.getAddress(),
      smetHero: await smetHero.getAddress(),
      smetLoot: await smetLoot.getAddress(),
      smetReward: await smetReward.getAddress()
    };

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

async function upgradeContract(proxyAddress: string, contractName: string) {
  console.log(`🔄 Upgrading ${contractName}...`);
  
  const ContractFactory = await ethers.getContractFactory(contractName);
  const upgraded = await upgrades.upgradeProxy(proxyAddress, ContractFactory);
  await upgraded.waitForDeployment();
  
  console.log(`✅ ${contractName} upgraded at:`, await upgraded.getAddress());
  return upgraded;
}

// Export functions for use in other scripts
export { deployUpgradeableContracts, upgradeContract };

// If called directly, run deployment
if (require.main === module) {
  deployUpgradeableContracts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}