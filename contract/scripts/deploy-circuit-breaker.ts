import { ethers } from 'hardhat';

async function deployCircuitBreakerSystem() {
  const [deployer] = await ethers.getSigners();
  
  console.log('Deploying Circuit Breaker System with account:', deployer.address);
  console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy Emergency Circuit Breaker Manager
  const EmergencyManager = await ethers.getContractFactory('EmergencyCircuitBreakerManager');
  const emergencyManager = await EmergencyManager.deploy();
  await emergencyManager.waitForDeployment();
  
  console.log('EmergencyCircuitBreakerManager deployed to:', await emergencyManager.getAddress());

  // Get existing contract addresses (if any)
  const contractAddresses = {
    SmetGold: process.env.SMET_GOLD_ADDRESS,
    SmetHero: process.env.SMET_HERO_ADDRESS,
    SmetLoot: process.env.SMET_LOOT_ADDRESS,
    SmetReward: process.env.SMET_REWARD_ADDRESS
  };

  // Register contracts with emergency manager
  for (const [name, address] of Object.entries(contractAddresses)) {
    if (address) {
      try {
        await emergencyManager.registerContract(address, name);
        console.log(`Registered ${name} at ${address}`);
      } catch (error) {
        console.log(`Failed to register ${name}:`, error);
      }
    }
  }

  // Set up emergency operators (add deployer as emergency operator)
  await emergencyManager.addEmergencyOperator(deployer.address);
  console.log('Added deployer as emergency operator');

  return {
    emergencyManager: await emergencyManager.getAddress()
  };
}

if (require.main === module) {
  deployCircuitBreakerSystem()
    .then((addresses) => {
      console.log('Circuit Breaker System deployed successfully:');
      console.log(addresses);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { deployCircuitBreakerSystem };