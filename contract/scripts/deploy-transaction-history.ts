import { ethers } from 'hardhat';

async function deployTransactionHistorySystem() {
  console.log('📊 Deploying Transaction History System');
  console.log('=====================================\n');

  const [deployer] = await ethers.getSigners();
  
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy TransactionHistory contract
  console.log('\n1. Deploying TransactionHistory contract...');
  const TransactionHistory = await ethers.getContractFactory('TransactionHistory');
  const transactionHistory = await TransactionHistory.deploy();
  await transactionHistory.waitForDeployment();
  
  const historyAddress = await transactionHistory.getAddress();
  console.log('✅ TransactionHistory deployed to:', historyAddress);

  // Deploy updated contracts with transaction history integration
  console.log('\n2. Deploying updated contracts...');
  
  // Deploy SmetGold with transaction history
  const SmetGold = await ethers.getContractFactory('SmetGold');
  const smetGold = await SmetGold.deploy(historyAddress);
  await smetGold.waitForDeployment();
  console.log('✅ SmetGold deployed to:', await smetGold.getAddress());

  // Deploy SmetHero with transaction history
  const SmetHero = await ethers.getContractFactory('SmetHero');
  const smetHero = await SmetHero.deploy(historyAddress);
  await smetHero.waitForDeployment();
  console.log('✅ SmetHero deployed to:', await smetHero.getAddress());

  // Deploy SmetLoot with transaction history
  const SmetLoot = await ethers.getContractFactory('SmetLoot');
  const smetLoot = await SmetLoot.deploy(historyAddress);
  await smetLoot.waitForDeployment();
  console.log('✅ SmetLoot deployed to:', await smetLoot.getAddress());

  // Test transaction recording
  console.log('\n3. Testing transaction recording...');
  
  // Test ERC20 transfer
  await smetGold.transfer(deployer.address, ethers.parseEther('100'));
  console.log('✅ Recorded ERC20 transfer transaction');

  // Test ERC721 mint
  await smetHero.mint(deployer.address);
  console.log('✅ Recorded ERC721 mint transaction');

  // Test ERC1155 mint
  await smetLoot.mint(deployer.address, 1, 10);
  console.log('✅ Recorded ERC1155 mint transaction');

  // Check transaction count
  const totalTransactions = await transactionHistory.getTotalTransactions();
  const userTransactionCount = await transactionHistory.getUserTransactionCount(deployer.address);
  
  console.log('\n4. Transaction Statistics:');
  console.log('Total transactions recorded:', totalTransactions.toString());
  console.log('User transactions:', userTransactionCount.toString());

  // Get user transactions
  const userTransactions = await transactionHistory.getUserTransactionsPaginated(
    deployer.address,
    0,
    10
  );
  
  console.log('\n5. Recent User Transactions:');
  for (let i = 0; i < userTransactions.length; i++) {
    const tx = userTransactions[i];
    console.log(`  ${i + 1}. ${tx.action} on ${tx.contractAddress} - Amount: ${tx.amount} - TokenId: ${tx.tokenId}`);
  }

  return {
    transactionHistory: historyAddress,
    smetGold: await smetGold.getAddress(),
    smetHero: await smetHero.getAddress(),
    smetLoot: await smetLoot.getAddress()
  };
}

if (require.main === module) {
  deployTransactionHistorySystem()
    .then((addresses) => {
      console.log('\n🎉 Transaction History System deployed successfully!');
      console.log('\nContract Addresses:');
      console.log('TransactionHistory:', addresses.transactionHistory);
      console.log('SmetGold:', addresses.smetGold);
      console.log('SmetHero:', addresses.smetHero);
      console.log('SmetLoot:', addresses.smetLoot);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { deployTransactionHistorySystem };