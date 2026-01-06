import { ethers } from 'hardhat';

async function deployRewardAnalytics() {
  console.log('📊 Deploying Reward Analytics System');
  console.log('===================================\n');

  const [deployer] = await ethers.getSigners();
  
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy RewardAnalytics contract
  console.log('\n1. Deploying RewardAnalytics contract...');
  const RewardAnalytics = await ethers.getContractFactory('RewardAnalytics');
  const rewardAnalytics = await RewardAnalytics.deploy();
  await rewardAnalytics.waitForDeployment();
  
  const analyticsAddress = await rewardAnalytics.getAddress();
  console.log('✅ RewardAnalytics deployed to:', analyticsAddress);

  // Test probability calculations
  console.log('\n2. Testing probability calculations...');
  
  const testWeights = [4500, 2500, 1500, 1000, 500]; // Example weights
  const probabilities = await rewardAnalytics.calculateProbabilities(testWeights);
  
  console.log('Probability calculations:');
  probabilities.forEach((prob, index) => {
    console.log(`  Reward ${index}: ${Number(prob.probability) / 100}% (Weight: ${prob.weight})`);
  });

  // Test contract stats (mock data)
  console.log('\n3. Testing analytics functions...');
  
  // Authorize the analytics contract (in real deployment, this would be done by reward contracts)
  await rewardAnalytics.authorizeContract(deployer.address);
  console.log('✅ Contract authorized for testing');

  // Record some test data
  await rewardAnalytics.recordRewardOpened(deployer.address, 0);
  await rewardAnalytics.recordRewardOpened(deployer.address, 1);
  await rewardAnalytics.recordRewardClaimed(ethers.parseEther('0.1'));
  
  console.log('✅ Test data recorded');

  // Get contract stats
  const [totalOpened, totalClaimed, totalValue] = await rewardAnalytics.getContractStats(deployer.address);
  console.log(`Stats - Opened: ${totalOpened}, Claimed: ${totalClaimed}, Value: ${ethers.formatEther(totalValue)} ETH`);

  // Get reward distribution
  const distribution = await rewardAnalytics.getRewardDistribution(deployer.address, 5);
  console.log('Reward distribution:', distribution.map(d => Number(d)));

  console.log('\n4. Generating sample visualization data...');
  
  // Generate sample data for frontend
  const sampleData = {
    contractAddress: analyticsAddress,
    probabilities: probabilities.map((prob, index) => ({
      rewardIndex: index,
      weight: Number(prob.weight),
      probability: Number(prob.probability) / 100,
      name: `Reward ${index + 1}`
    })),
    distribution: distribution.map((count, index) => ({
      rewardId: index,
      name: `Reward ${index + 1}`,
      count: Number(count),
      percentage: Number(count) > 0 ? (Number(count) / Number(totalOpened)) * 100 : 0
    })),
    stats: {
      totalOpened: Number(totalOpened),
      totalClaimed: Number(totalClaimed),
      totalValue: ethers.formatEther(totalValue)
    }
  };

  console.log('Sample visualization data generated:');
  console.log(JSON.stringify(sampleData, null, 2));

  return {
    rewardAnalytics: analyticsAddress,
    sampleData
  };
}

if (require.main === module) {
  deployRewardAnalytics()
    .then((result) => {
      console.log('\n🎉 Reward Analytics System deployed successfully!');
      console.log('\nContract Address:');
      console.log('RewardAnalytics:', result.rewardAnalytics);
      console.log('\nAdd this to your frontend environment:');
      console.log(`NEXT_PUBLIC_ANALYTICS_ADDRESS=${result.rewardAnalytics}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { deployRewardAnalytics };