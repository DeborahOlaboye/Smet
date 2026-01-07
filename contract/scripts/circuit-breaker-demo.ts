import { ethers } from 'hardhat';
import { CircuitBreakerMonitor } from './circuit-breaker-monitor';

async function demonstrateCircuitBreakerSystem() {
  console.log('🔧 Circuit Breaker System Integration Demo');
  console.log('==========================================\n');

  const [owner, breaker, user] = await ethers.getSigners();
  
  // Deploy all contracts
  console.log('1. Deploying contracts...');
  
  const SmetGold = await ethers.getContractFactory('SmetGold');
  const smetGold = await SmetGold.deploy();
  await smetGold.waitForDeployment();
  
  const SmetHero = await ethers.getContractFactory('SmetHero');
  const smetHero = await SmetHero.deploy();
  await smetHero.waitForDeployment();
  
  const SmetLoot = await ethers.getContractFactory('SmetLoot');
  const smetLoot = await SmetLoot.deploy();
  await smetLoot.waitForDeployment();
  
  const EmergencyManager = await ethers.getContractFactory('EmergencyCircuitBreakerManager');
  const emergencyManager = await EmergencyManager.deploy();
  await emergencyManager.waitForDeployment();
  
  console.log('✅ All contracts deployed successfully\n');
  
  // Set up emergency manager
  console.log('2. Setting up emergency management...');
  
  await emergencyManager.registerContract(await smetGold.getAddress(), 'SmetGold');
  await emergencyManager.registerContract(await smetHero.getAddress(), 'SmetHero');
  await emergencyManager.registerContract(await smetLoot.getAddress(), 'SmetLoot');
  
  await emergencyManager.addEmergencyOperator(await breaker.getAddress());
  
  console.log('✅ Emergency management configured\n');
  
  // Authorize breakers on individual contracts
  console.log('3. Authorizing circuit breakers...');
  
  await smetGold.authorizeBreaker(await breaker.getAddress());
  await smetHero.authorizeBreaker(await breaker.getAddress());
  await smetLoot.authorizeBreaker(await breaker.getAddress());
  
  console.log('✅ Circuit breakers authorized\n');
  
  // Demonstrate normal operations
  console.log('4. Testing normal operations...');
  
  // Test ERC20 transfer
  await smetGold.transfer(await user.getAddress(), ethers.parseEther('100'));
  console.log('✅ SmetGold transfer successful');
  
  // Test ERC721 mint
  await smetHero.mint(await user.getAddress());
  console.log('✅ SmetHero mint successful');
  
  // Test ERC1155 mint
  await smetLoot.mint(await user.getAddress(), 1, 10);
  console.log('✅ SmetLoot mint successful\n');
  
  // Demonstrate circuit breaking
  console.log('5. Testing circuit breaker functionality...');
  
  const transferSelector = smetGold.interface.getFunction('transfer').selector;
  const mintHeroSelector = smetHero.interface.getFunction('mint').selector;
  const mintLootSelector = smetLoot.interface.getFunction('mint').selector;
  
  // Break individual circuits
  await smetGold.connect(breaker).breakCircuit(transferSelector);
  await smetHero.connect(breaker).breakCircuit(mintHeroSelector);
  await smetLoot.connect(breaker).breakCircuit(mintLootSelector);
  
  console.log('🔴 Circuits broken for critical functions');
  
  // Try operations (should fail)
  try {
    await smetGold.transfer(await user.getAddress(), ethers.parseEther('50'));
    console.log('❌ Transfer should have failed');
  } catch (error) {
    console.log('✅ Transfer correctly blocked by circuit breaker');
  }
  
  try {
    await smetHero.mint(await user.getAddress());
    console.log('❌ Mint should have failed');
  } catch (error) {
    console.log('✅ Hero mint correctly blocked by circuit breaker');
  }
  
  try {
    await smetLoot.mint(await user.getAddress(), 2, 5);
    console.log('❌ Mint should have failed');
  } catch (error) {
    console.log('✅ Loot mint correctly blocked by circuit breaker');
  }
  
  console.log();
  
  // Demonstrate emergency operations
  console.log('6. Testing emergency operations...');
  
  // Emergency break all for approve function
  const approveSelector = '0x095ea7b3';
  await emergencyManager.connect(breaker).emergencyBreakAll(approveSelector);
  console.log('🚨 Emergency break executed for approve function across all contracts');
  
  // Check status
  console.log('\n7. Circuit breaker status:');
  console.log('SmetGold transfer:', await smetGold.isCircuitBroken(transferSelector) ? '🔴 BROKEN' : '🟢 OK');
  console.log('SmetGold approve:', await smetGold.isCircuitBroken(approveSelector) ? '🔴 BROKEN' : '🟢 OK');
  console.log('SmetHero mint:', await smetHero.isCircuitBroken(mintHeroSelector) ? '🔴 BROKEN' : '🟢 OK');
  console.log('SmetLoot mint:', await smetLoot.isCircuitBroken(mintLootSelector) ? '🔴 BROKEN' : '🟢 OK');
  
  // Restore circuits
  console.log('\n8. Restoring circuits...');
  
  await smetGold.restoreCircuit(transferSelector);
  await smetHero.restoreCircuit(mintHeroSelector);
  await smetLoot.restoreCircuit(mintLootSelector);
  await emergencyManager.emergencyRestoreAll(approveSelector);
  
  console.log('✅ All circuits restored');
  
  // Test operations again (should work)
  console.log('\n9. Testing restored functionality...');
  
  await smetGold.transfer(await user.getAddress(), ethers.parseEther('25'));
  console.log('✅ SmetGold transfer working after restoration');
  
  await smetHero.mint(await user.getAddress());
  console.log('✅ SmetHero mint working after restoration');
  
  await smetLoot.mint(await user.getAddress(), 3, 15);
  console.log('✅ SmetLoot mint working after restoration');
  
  console.log('\n🎉 Circuit Breaker System Integration Demo Complete!');
  console.log('\nContract Addresses:');
  console.log('SmetGold:', await smetGold.getAddress());
  console.log('SmetHero:', await smetHero.getAddress());
  console.log('SmetLoot:', await smetLoot.getAddress());
  console.log('EmergencyManager:', await emergencyManager.getAddress());
}

if (require.main === module) {
  demonstrateCircuitBreakerSystem()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { demonstrateCircuitBreakerSystem };