import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Signer } from 'ethers';

describe('RewardAnalytics', function () {
  let rewardAnalytics: any;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let contract1: Signer;
  
  beforeEach(async function () {
    [owner, user1, user2, contract1] = await ethers.getSigners();
    
    const RewardAnalytics = await ethers.getContractFactory('RewardAnalytics');
    rewardAnalytics = await RewardAnalytics.deploy();
    await rewardAnalytics.waitForDeployment();
  });

  describe('Authorization', function () {
    it('Should authorize contracts', async function () {
      const contractAddress = await contract1.getAddress();
      
      await rewardAnalytics.authorizeContract(contractAddress);
      expect(await rewardAnalytics.authorizedContracts(contractAddress)).to.be.true;
    });

    it('Should only allow owner to authorize contracts', async function () {
      const contractAddress = await contract1.getAddress();
      
      await expect(
        rewardAnalytics.connect(user1).authorizeContract(contractAddress)
      ).to.be.revertedWith('Not owner');
    });
  });

  describe('Recording Rewards', function () {
    beforeEach(async function () {
      await rewardAnalytics.authorizeContract(await contract1.getAddress());
    });

    it('Should record reward opened', async function () {
      const userAddress = await user1.getAddress();
      
      await expect(
        rewardAnalytics.connect(contract1).recordRewardOpened(userAddress, 0)
      ).to.emit(rewardAnalytics, 'RewardOpened')
        .withArgs(await contract1.getAddress(), userAddress, 0);
      
      const [totalOpened] = await rewardAnalytics.getContractStats(await contract1.getAddress());
      expect(totalOpened).to.equal(1);
    });

    it('Should record reward claimed', async function () {
      const value = ethers.parseEther('0.1');
      
      await expect(
        rewardAnalytics.connect(contract1).recordRewardClaimed(value)
      ).to.emit(rewardAnalytics, 'StatsUpdated');
      
      const [, totalClaimed, totalValue] = await rewardAnalytics.getContractStats(await contract1.getAddress());
      expect(totalClaimed).to.equal(1);
      expect(totalValue).to.equal(value);
    });

    it('Should only allow authorized contracts to record', async function () {
      const userAddress = await user1.getAddress();
      
      await expect(
        rewardAnalytics.connect(user1).recordRewardOpened(userAddress, 0)
      ).to.be.revertedWith('Not authorized');
    });
  });

  describe('Reward Distribution', function () {
    beforeEach(async function () {
      await rewardAnalytics.authorizeContract(await contract1.getAddress());
      
      // Record some rewards
      const userAddress = await user1.getAddress();
      await rewardAnalytics.connect(contract1).recordRewardOpened(userAddress, 0);
      await rewardAnalytics.connect(contract1).recordRewardOpened(userAddress, 0);
      await rewardAnalytics.connect(contract1).recordRewardOpened(userAddress, 1);
      await rewardAnalytics.connect(contract1).recordRewardOpened(userAddress, 2);
    });

    it('Should get reward distribution', async function () {
      const distribution = await rewardAnalytics.getRewardDistribution(await contract1.getAddress(), 5);
      
      expect(distribution[0]).to.equal(2); // Reward 0 opened twice
      expect(distribution[1]).to.equal(1); // Reward 1 opened once
      expect(distribution[2]).to.equal(1); // Reward 2 opened once
      expect(distribution[3]).to.equal(0); // Reward 3 not opened
      expect(distribution[4]).to.equal(0); // Reward 4 not opened
    });

    it('Should get contract stats', async function () {
      await rewardAnalytics.connect(contract1).recordRewardClaimed(ethers.parseEther('0.5'));
      
      const [totalOpened, totalClaimed, totalValue] = await rewardAnalytics.getContractStats(await contract1.getAddress());
      
      expect(totalOpened).to.equal(4);
      expect(totalClaimed).to.equal(1);
      expect(totalValue).to.equal(ethers.parseEther('0.5'));
    });
  });

  describe('Probability Calculations', function () {
    it('Should calculate probabilities correctly', async function () {
      const weights = [5000, 3000, 1500, 500]; // Total: 10000
      const probabilities = await rewardAnalytics.calculateProbabilities(weights);
      
      expect(probabilities.length).to.equal(4);
      
      // Check probabilities (scaled by 10000)
      expect(probabilities[0].probability).to.equal(5000); // 50%
      expect(probabilities[1].probability).to.equal(3000); // 30%
      expect(probabilities[2].probability).to.equal(1500); // 15%
      expect(probabilities[3].probability).to.equal(500);  // 5%
      
      // Check weights
      expect(probabilities[0].weight).to.equal(5000);
      expect(probabilities[1].weight).to.equal(3000);
      expect(probabilities[2].weight).to.equal(1500);
      expect(probabilities[3].weight).to.equal(500);
    });

    it('Should handle edge cases in probability calculation', async function () {
      // Single reward
      const singleWeight = [1000];
      const singleProb = await rewardAnalytics.calculateProbabilities(singleWeight);
      expect(singleProb[0].probability).to.equal(10000); // 100%
      
      // Equal weights
      const equalWeights = [2500, 2500, 2500, 2500];
      const equalProbs = await rewardAnalytics.calculateProbabilities(equalWeights);
      equalProbs.forEach(prob => {
        expect(prob.probability).to.equal(2500); // 25% each
      });
    });
  });

  describe('Multiple Contracts', function () {
    let contract2: Signer;
    
    beforeEach(async function () {
      [, , , , contract2] = await ethers.getSigners();
      
      await rewardAnalytics.authorizeContract(await contract1.getAddress());
      await rewardAnalytics.authorizeContract(await contract2.getAddress());
    });

    it('Should track stats separately for different contracts', async function () {
      const userAddress = await user1.getAddress();
      
      // Contract 1 activity
      await rewardAnalytics.connect(contract1).recordRewardOpened(userAddress, 0);
      await rewardAnalytics.connect(contract1).recordRewardClaimed(ethers.parseEther('0.1'));
      
      // Contract 2 activity
      await rewardAnalytics.connect(contract2).recordRewardOpened(userAddress, 1);
      await rewardAnalytics.connect(contract2).recordRewardOpened(userAddress, 1);
      
      // Check contract 1 stats
      const [opened1, claimed1, value1] = await rewardAnalytics.getContractStats(await contract1.getAddress());
      expect(opened1).to.equal(1);
      expect(claimed1).to.equal(1);
      expect(value1).to.equal(ethers.parseEther('0.1'));
      
      // Check contract 2 stats
      const [opened2, claimed2, value2] = await rewardAnalytics.getContractStats(await contract2.getAddress());
      expect(opened2).to.equal(2);
      expect(claimed2).to.equal(0);
      expect(value2).to.equal(0);
    });
  });
});