import { ethers, upgrades } from "hardhat";

interface ContractAddresses {
  smetGold: string;
  smetHero: string;
  smetLoot: string;
  smetReward: string;
}

class ContractMigrator {
  private oldAddresses: ContractAddresses;
  private newAddresses: ContractAddresses = {
    smetGold: "",
    smetHero: "",
    smetLoot: "",
    smetReward: ""
  };

  constructor(oldAddresses: ContractAddresses) {
    this.oldAddresses = oldAddresses;
  }

  async migrateToUpgradeable(): Promise<ContractAddresses> {
    console.log("🔄 Starting migration to upgradeable contracts...");

    // Step 1: Deploy new upgradeable contracts
    await this.deployUpgradeableContracts();

    // Step 2: Migrate state and ownership
    await this.migrateState();

    // Step 3: Update cross-contract references
    await this.updateReferences();

    console.log("✅ Migration completed successfully!");
    return this.newAddresses;
  }

  private async deployUpgradeableContracts(): Promise<void> {
    console.log("📦 Deploying upgradeable contracts...");

    // Deploy SmetGold
    const SmetGold = await ethers.getContractFactory("SmetGoldUpgradeable");
    const smetGoldProxy = await upgrades.deployProxy(SmetGold, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await smetGoldProxy.waitForDeployment();
    this.newAddresses.smetGold = await smetGoldProxy.getAddress();
    console.log("✅ SmetGold deployed to:", this.newAddresses.smetGold);

    // Deploy SmetHero
    const SmetHero = await ethers.getContractFactory("SmetHeroUpgradeable");
    const smetHeroProxy = await upgrades.deployProxy(SmetHero, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await smetHeroProxy.waitForDeployment();
    this.newAddresses.smetHero = await smetHeroProxy.getAddress();
    console.log("✅ SmetHero deployed to:", this.newAddresses.smetHero);

    // Deploy SmetLoot
    const SmetLoot = await ethers.getContractFactory("SmetLootUpgradeable");
    const smetLootProxy = await upgrades.deployProxy(SmetLoot, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await smetLootProxy.waitForDeployment();
    this.newAddresses.smetLoot = await smetLootProxy.getAddress();
    console.log("✅ SmetLoot deployed to:", this.newAddresses.smetLoot);

    // Note: SmetReward requires special handling due to VRF integration
    console.log("⚠️ SmetReward migration requires manual VRF reconfiguration");
  }

  private async migrateState(): Promise<void> {
    console.log("🔄 Migrating contract state...");

    // Migrate SmetGold state
    await this.migrateSmetGoldState();

    // Migrate SmetHero state  
    await this.migrateSmetHeroState();

    // Note: SmetLoot and SmetReward state migration would require custom logic
    console.log("⚠️ Manual state migration may be required for complex contracts");
  }

  private async migrateSmetGoldState(): Promise<void> {
    console.log("Migrating SmetGold state...");

    const oldContract = await ethers.getContractAt("SmetGold", this.oldAddresses.smetGold);
    const newContract = await ethers.getContractAt("SmetGoldUpgradeable", this.newAddresses.smetGold);

    // Get current state
    const totalSupply = await oldContract.totalSupply();
    const ownerBalance = await oldContract.balanceOf(await oldContract.owner());

    // Note: This is a simplified example
    // Real migration would need to handle all balances and allowances
    console.log(`Total supply to migrate: ${ethers.formatEther(totalSupply)} SGOLD`);
  }

  private async migrateSmetHeroState(): Promise<void> {
    console.log("Migrating SmetHero state...");

    const oldContract = await ethers.getContractAt("SmetHero", this.oldAddresses.smetHero);
    const newContract = await ethers.getContractAt("SmetHeroUpgradeable", this.newAddresses.smetHero);

    // Get current nextId
    const nextId = await oldContract.nextId();
    console.log(`Next ID to set: ${nextId}`);

    // Note: Would need to migrate all existing NFTs and their metadata
  }

  private async updateReferences(): Promise<void> {
    console.log("🔗 Updating cross-contract references...");

    // Update any contracts that reference the old addresses
    // This would include updating prize pools, whitelists, etc.
    
    console.log("⚠️ Manual reference updates may be required");
  }

  async pauseOldContracts(): Promise<void> {
    console.log("⏸️ Pausing old contracts...");

    try {
      const oldSmetGold = await ethers.getContractAt("SmetGold", this.oldAddresses.smetGold);
      if (await oldSmetGold.owner() === (await ethers.getSigners())[0].address) {
        await oldSmetGold.pause();
        console.log("✅ SmetGold paused");
      }
    } catch (error) {
      console.log("⚠️ Could not pause SmetGold:", error);
    }

    // Repeat for other contracts...
  }

  async generateMigrationReport(): Promise<void> {
    console.log("\n📊 Migration Report");
    console.log("==================");
    console.log("Old Addresses:");
    console.log(`  SmetGold: ${this.oldAddresses.smetGold}`);
    console.log(`  SmetHero: ${this.oldAddresses.smetHero}`);
    console.log(`  SmetLoot: ${this.oldAddresses.smetLoot}`);
    console.log(`  SmetReward: ${this.oldAddresses.smetReward}`);
    
    console.log("\nNew Addresses:");
    console.log(`  SmetGold: ${this.newAddresses.smetGold}`);
    console.log(`  SmetHero: ${this.newAddresses.smetHero}`);
    console.log(`  SmetLoot: ${this.newAddresses.smetLoot}`);
    console.log(`  SmetReward: ${this.newAddresses.smetReward}`);

    console.log("\n⚠️ Manual Steps Required:");
    console.log("1. Update frontend to use new addresses");
    console.log("2. Migrate user balances and NFTs");
    console.log("3. Update VRF subscription for SmetReward");
    console.log("4. Configure timelock addresses");
    console.log("5. Test all functionality");
    console.log("6. Announce migration to users");
  }
}

// Main migration function
async function migrateContracts() {
  // Current deployed addresses
  const oldAddresses: ContractAddresses = {
    smetGold: "0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2",
    smetHero: "0x877D1FDa6a6b668b79ca4A42388E0825667d233E",
    smetLoot: "0xa5046538c6338DC8b52a22675338a4623D4B5475",
    smetReward: "0xeF85822c30D194c2B2F7cC17223C64292Bfe611b"
  };

  const migrator = new ContractMigrator(oldAddresses);
  
  try {
    const newAddresses = await migrator.migrateToUpgradeable();
    await migrator.generateMigrationReport();
    
    console.log("\n🎉 Migration completed!");
    console.log("Save these new addresses for future reference:");
    console.log(JSON.stringify(newAddresses, null, 2));
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Export for use in other scripts
export { ContractMigrator, migrateContracts };

// If called directly, run migration
if (require.main === module) {
  migrateContracts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}