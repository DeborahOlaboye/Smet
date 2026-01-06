import { ethers } from "hardhat";

async function emergencyResponse() {
  console.log("🚨 EMERGENCY RESPONSE PROTOCOL ACTIVATED 🚨");
  
  const [deployer] = await ethers.getSigners();
  console.log("Emergency responder:", deployer.address);

  // Contract addresses (update with actual deployed addresses)
  const SMET_REWARD = "0xeF85822c30D194c2B2F7cC17223C64292Bfe611b";
  const SMET_GOLD = "0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2";
  const SMET_HERO = "0x877D1FDa6a6b668b79ca4A42388E0825667d233E";
  const SMET_LOOT = "0xa5046538c6338DC8b52a22675338a4623D4B5475";

  try {
    // Step 1: Deploy Emergency Recovery Contract
    console.log("Deploying Emergency Recovery Contract...");
    const EmergencyRecovery = await ethers.getContractFactory("EmergencyRecovery");
    const emergencyRecovery = await EmergencyRecovery.deploy();
    await emergencyRecovery.waitForDeployment();
    console.log("Emergency Recovery deployed to:", await emergencyRecovery.getAddress());

    // Step 2: Deploy Circuit Breaker
    console.log("Deploying Circuit Breaker...");
    const CircuitBreaker = await ethers.getContractFactory("CircuitBreaker");
    const circuitBreaker = await CircuitBreaker.deploy();
    await circuitBreaker.waitForDeployment();
    console.log("Circuit Breaker deployed to:", await circuitBreaker.getAddress());

    // Step 3: Pause all contracts
    console.log("Pausing all contracts...");
    
    const smetReward = await ethers.getContractAt("SmetReward", SMET_REWARD);
    const smetGold = await ethers.getContractAt("SmetGold", SMET_GOLD);
    const smetHero = await ethers.getContractAt("SmetHero", SMET_HERO);
    const smetLoot = await ethers.getContractAt("SmetLoot", SMET_LOOT);

    await smetReward.pause();
    console.log("✅ SmetReward paused");
    
    await smetGold.pause();
    console.log("✅ SmetGold paused");
    
    await smetHero.pause();
    console.log("✅ SmetHero paused");
    
    await smetLoot.pause();
    console.log("✅ SmetLoot paused");

    // Step 4: Set emergency recovery addresses
    console.log("Setting emergency recovery addresses...");
    const recoveryAddress = await emergencyRecovery.getAddress();
    
    await smetReward.setEmergencyRecovery(recoveryAddress);
    await smetGold.setEmergencyRecovery(recoveryAddress);
    await smetHero.setEmergencyRecovery(recoveryAddress);
    await smetLoot.setEmergencyRecovery(recoveryAddress);
    
    console.log("✅ Emergency recovery addresses set");

    console.log("\n🔧 EMERGENCY RESPONSE COMPLETE");
    console.log("All contracts have been paused and emergency recovery system activated.");
    console.log("Emergency Recovery Contract:", recoveryAddress);
    console.log("Circuit Breaker Contract:", await circuitBreaker.getAddress());

  } catch (error) {
    console.error("❌ Emergency response failed:", error);
    throw error;
  }
}

async function emergencyUnpause() {
  console.log("🔄 EMERGENCY UNPAUSE PROTOCOL");
  
  const SMET_REWARD = "0xeF85822c30D194c2B2F7cC17223C64292Bfe611b";
  const SMET_GOLD = "0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2";
  const SMET_HERO = "0x877D1FDa6a6b668b79ca4A42388E0825667d233E";
  const SMET_LOOT = "0xa5046538c6338DC8b52a22675338a4623D4B5475";

  const smetReward = await ethers.getContractAt("SmetReward", SMET_REWARD);
  const smetGold = await ethers.getContractAt("SmetGold", SMET_GOLD);
  const smetHero = await ethers.getContractAt("SmetHero", SMET_HERO);
  const smetLoot = await ethers.getContractAt("SmetLoot", SMET_LOOT);

  await smetReward.unpause();
  await smetGold.unpause();
  await smetHero.unpause();
  await smetLoot.unpause();

  console.log("✅ All contracts unpaused");
}

// Export functions for use in emergency situations
export { emergencyResponse, emergencyUnpause };

// If called directly, run emergency response
if (require.main === module) {
  emergencyResponse()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}