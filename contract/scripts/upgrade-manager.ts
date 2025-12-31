import { ethers, upgrades } from "hardhat";

interface UpgradeInfo {
  proxyAddress: string;
  contractName: string;
  currentVersion: string;
  newVersion: string;
}

class UpgradeManager {
  private upgrades: UpgradeInfo[] = [];

  async validateUpgrade(proxyAddress: string, contractName: string): Promise<boolean> {
    try {
      console.log(`🔍 Validating upgrade for ${contractName}...`);
      
      const ContractFactory = await ethers.getContractFactory(contractName);
      await upgrades.validateUpgrade(proxyAddress, ContractFactory);
      
      console.log(`✅ ${contractName} upgrade validation passed`);
      return true;
    } catch (error) {
      console.error(`❌ ${contractName} upgrade validation failed:`, error);
      return false;
    }
  }

  async prepareUpgrade(proxyAddress: string, contractName: string): Promise<string> {
    console.log(`📦 Preparing upgrade for ${contractName}...`);
    
    const ContractFactory = await ethers.getContractFactory(contractName);
    const implementationAddress = await upgrades.prepareUpgrade(proxyAddress, ContractFactory);
    
    console.log(`✅ New implementation deployed at: ${implementationAddress}`);
    return implementationAddress as string;
  }

  async upgradeContract(proxyAddress: string, contractName: string): Promise<string> {
    console.log(`🔄 Upgrading ${contractName}...`);
    
    // Validate upgrade first
    const isValid = await this.validateUpgrade(proxyAddress, contractName);
    if (!isValid) {
      throw new Error(`Upgrade validation failed for ${contractName}`);
    }

    const ContractFactory = await ethers.getContractFactory(contractName);
    const upgraded = await upgrades.upgradeProxy(proxyAddress, ContractFactory);
    await upgraded.waitForDeployment();
    
    const upgradedAddress = await upgraded.getAddress();
    console.log(`✅ ${contractName} upgraded successfully`);
    
    return upgradedAddress;
  }

  async upgradeAll(contracts: { [key: string]: string }): Promise<void> {
    console.log("🚀 Starting batch upgrade process...");
    
    const upgradeableContracts = [
      "SmetGoldUpgradeable",
      "SmetHeroUpgradeable", 
      "SmetLootUpgradeable",
      "SmetRewardUpgradeable"
    ];

    for (const contractName of upgradeableContracts) {
      const contractKey = contractName.replace("Upgradeable", "").toLowerCase();
      const proxyAddress = contracts[contractKey];
      
      if (proxyAddress) {
        try {
          await this.upgradeContract(proxyAddress, contractName);
        } catch (error) {
          console.error(`❌ Failed to upgrade ${contractName}:`, error);
          throw error;
        }
      }
    }
    
    console.log("🎉 All contracts upgraded successfully!");
  }

  async getImplementationAddress(proxyAddress: string): Promise<string> {
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    return implementationAddress;
  }

  async getAdminAddress(proxyAddress: string): Promise<string> {
    const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
    return adminAddress;
  }

  async transferProxyAdminOwnership(proxyAddress: string, newOwner: string): Promise<void> {
    console.log(`🔄 Transferring proxy admin ownership to ${newOwner}...`);
    await upgrades.admin.transferProxyAdminOwnership(newOwner);
    console.log("✅ Proxy admin ownership transferred");
  }

  async forceImport(proxyAddress: string, contractName: string): Promise<void> {
    console.log(`📥 Force importing ${contractName}...`);
    const ContractFactory = await ethers.getContractFactory(contractName);
    await upgrades.forceImport(proxyAddress, ContractFactory);
    console.log(`✅ ${contractName} imported successfully`);
  }

  async checkUpgradeability(contractName: string): Promise<void> {
    console.log(`🔍 Checking upgradeability for ${contractName}...`);
    
    const ContractFactory = await ethers.getContractFactory(contractName);
    await upgrades.validateImplementation(ContractFactory);
    
    console.log(`✅ ${contractName} is upgradeable`);
  }
}

// Specific upgrade functions
async function upgradeToV2() {
  console.log("🔄 Upgrading to V2...");
  
  const manager = new UpgradeManager();
  
  // Contract addresses (update with actual deployed addresses)
  const contracts = {
    smetgold: process.env.SMET_GOLD_PROXY || "",
    smethero: process.env.SMET_HERO_PROXY || "",
    smetloot: process.env.SMET_LOOT_PROXY || "",
    smetreward: process.env.SMET_REWARD_PROXY || ""
  };

  await manager.upgradeAll(contracts);
}

async function validateAllUpgrades() {
  console.log("🔍 Validating all contract upgrades...");
  
  const manager = new UpgradeManager();
  
  const contracts = [
    "SmetGoldUpgradeable",
    "SmetHeroUpgradeable",
    "SmetLootUpgradeable", 
    "SmetRewardUpgradeable"
  ];

  for (const contractName of contracts) {
    await manager.checkUpgradeability(contractName);
  }
  
  console.log("✅ All contracts are upgradeable");
}

async function getContractInfo(proxyAddress: string) {
  console.log(`📋 Getting contract info for ${proxyAddress}...`);
  
  const manager = new UpgradeManager();
  
  const implementationAddress = await manager.getImplementationAddress(proxyAddress);
  const adminAddress = await manager.getAdminAddress(proxyAddress);
  
  console.log("Implementation:", implementationAddress);
  console.log("Admin:", adminAddress);
  
  return { implementationAddress, adminAddress };
}

// Export for use in other scripts
export { UpgradeManager, upgradeToV2, validateAllUpgrades, getContractInfo };

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case "validate":
      await validateAllUpgrades();
      break;
    case "upgrade":
      await upgradeToV2();
      break;
    case "info":
      if (args[1]) {
        await getContractInfo(args[1]);
      } else {
        console.error("Please provide proxy address");
      }
      break;
    case "prepare":
      if (args[1] && args[2]) {
        const manager = new UpgradeManager();
        await manager.prepareUpgrade(args[1], args[2]);
      } else {
        console.error("Please provide proxy address and contract name");
      }
      break;
    default:
      console.log(`
Upgrade Manager CLI

Usage: npx ts-node upgrade-manager.ts [command] [options]

Commands:
  validate                    Validate all contract upgrades
  upgrade                     Upgrade all contracts to latest version
  info <proxyAddress>         Get contract implementation and admin info
  prepare <proxy> <contract>  Prepare upgrade for specific contract

Examples:
  npx ts-node upgrade-manager.ts validate
  npx ts-node upgrade-manager.ts upgrade
  npx ts-node upgrade-manager.ts info 0x123...
  npx ts-node upgrade-manager.ts prepare 0x123... SmetGoldUpgradeable
      `);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}