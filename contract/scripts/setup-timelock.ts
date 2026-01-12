import { ethers } from "hardhat";

async function setupTimelock() {
  console.log("🔧 Setting up Timelock for all contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Setup account:", deployer.address);

  // Contract addresses (update with actual deployed addresses)
  const TIMELOCK_ADDRESS = process.env.TIMELOCK_ADDRESS || "";
  const SMET_REWARD = "0xeF85822c30D194c2B2F7cC17223C64292Bfe611b";
  const SMET_GOLD = "0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2";
  const SMET_HERO = "0x877D1FDa6a6b668b79ca4A42388E0825667d233E";
  const SMET_LOOT = "0xa5046538c6338DC8b52a22675338a4623D4B5475";

  if (!TIMELOCK_ADDRESS) {
    console.log("Deploying new Timelock contract...");
    const Timelock = await ethers.getContractFactory("Timelock");
    const timelock = await Timelock.deploy(24 * 60 * 60); // 24 hours
    await timelock.waitForDeployment();
    
    const timelockAddress = await timelock.getAddress();
    console.log("✅ Timelock deployed to:", timelockAddress);
    
    // Set timelock addresses in all contracts
    await setupContractTimelock(SMET_REWARD, "SmetReward", timelockAddress);
    await setupContractTimelock(SMET_GOLD, "SmetGold", timelockAddress);
    await setupContractTimelock(SMET_HERO, "SmetHero", timelockAddress);
    await setupContractTimelock(SMET_LOOT, "SmetLoot", timelockAddress);
    
    console.log("🎉 Timelock setup complete!");
    console.log("📝 Save this timelock address:", timelockAddress);
  } else {
    console.log("Using existing timelock:", TIMELOCK_ADDRESS);
    
    // Set timelock addresses in all contracts
    await setupContractTimelock(SMET_REWARD, "SmetReward", TIMELOCK_ADDRESS);
    await setupContractTimelock(SMET_GOLD, "SmetGold", TIMELOCK_ADDRESS);
    await setupContractTimelock(SMET_HERO, "SmetHero", TIMELOCK_ADDRESS);
    await setupContractTimelock(SMET_LOOT, "SmetLoot", TIMELOCK_ADDRESS);
    
    console.log("🎉 Timelock addresses updated!");
  }
}

async function setupContractTimelock(contractAddress: string, contractName: string, timelockAddress: string) {
  try {
    console.log(`Setting timelock for ${contractName}...`);
    
    const contract = await ethers.getContractAt(contractName, contractAddress);
    const tx = await contract.setTimelock(timelockAddress);
    await tx.wait();
    
    console.log(`✅ ${contractName} timelock set`);
  } catch (error) {
    console.error(`❌ Failed to set timelock for ${contractName}:`, error);
  }
}

async function verifyTimelockSetup() {
  console.log("🔍 Verifying timelock setup...");
  
  const contracts = [
    { address: "0xeF85822c30D194c2B2F7cC17223C64292Bfe611b", name: "SmetReward" },
    { address: "0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2", name: "SmetGold" },
    { address: "0x877D1FDa6a6b668b79ca4A42388E0825667d233E", name: "SmetHero" },
    { address: "0xa5046538c6338DC8b52a22675338a4623D4B5475", name: "SmetLoot" }
  ];

  for (const contractInfo of contracts) {
    try {
      const contract = await ethers.getContractAt(contractInfo.name, contractInfo.address);
      const timelockAddress = await contract.timelock();
      
      console.log(`${contractInfo.name}: ${timelockAddress}`);
    } catch (error) {
      console.error(`❌ Failed to verify ${contractInfo.name}:`, error);
    }
  }
}

// Export functions for use in other scripts
export { setupTimelock, verifyTimelockSetup };

// If called directly, run setup
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes("--verify")) {
    verifyTimelockSetup()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    setupTimelock()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}