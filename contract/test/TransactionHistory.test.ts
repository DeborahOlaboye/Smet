import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Signer } from 'ethers';

describe('TransactionHistory', function () {
  let transactionHistory: any;
  let smetGold: any;
  let smetHero: any;
  let smetLoot: any;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy TransactionHistory
    const TransactionHistory = await ethers.getContractFactory('TransactionHistory');
    transactionHistory = await TransactionHistory.deploy();
    await transactionHistory.waitForDeployment();
    
    // Deploy contracts with transaction history
    const SmetGold = await ethers.getContractFactory('SmetGold');
    smetGold = await SmetGold.deploy(await transactionHistory.getAddress());
    await smetGold.waitForDeployment();
    
    const SmetHero = await ethers.getContractFactory('SmetHero');
    smetHero = await SmetHero.deploy(await transactionHistory.getAddress());
    await smetHero.waitForDeployment();
    
    const SmetLoot = await ethers.getContractFactory('SmetLoot');
    smetLoot = await SmetLoot.deploy(await transactionHistory.getAddress());
    await smetLoot.waitForDeployment();
  });

  describe('Transaction Recording', function () {
    it('Should record ERC20 transactions', async function () {
      const user1Address = await user1.getAddress();
      
      // Transfer tokens
      await smetGold.transfer(user1Address, ethers.parseEther('100'));
      
      // Check transaction was recorded
      const userTxCount = await transactionHistory.getUserTransactionCount(await owner.getAddress());
      expect(userTxCount).to.equal(1);
      
      const userTransactions = await transactionHistory.getUserTransactions(await owner.getAddress());
      expect(userTransactions.length).to.equal(1);
      
      const transaction = await transactionHistory.getTransaction(userTransactions[0]);
      expect(transaction.user).to.equal(await owner.getAddress());
      expect(transaction.contractAddress).to.equal(await smetGold.getAddress());
      expect(transaction.action).to.equal('TRANSFER');
      expect(transaction.amount).to.equal(ethers.parseEther('100'));
    });

    it('Should record ERC721 transactions', async function () {
      const user1Address = await user1.getAddress();
      
      // Mint NFT
      await smetHero.mint(user1Address);
      
      // Check transaction was recorded
      const userTxCount = await transactionHistory.getUserTransactionCount(user1Address);
      expect(userTxCount).to.equal(1);
      
      const userTransactions = await transactionHistory.getUserTransactions(user1Address);
      const transaction = await transactionHistory.getTransaction(userTransactions[0]);
      
      expect(transaction.user).to.equal(user1Address);
      expect(transaction.contractAddress).to.equal(await smetHero.getAddress());
      expect(transaction.action).to.equal('MINT');
      expect(transaction.tokenId).to.equal(1);
    });

    it('Should record ERC1155 transactions', async function () {
      const user1Address = await user1.getAddress();
      
      // Mint tokens
      await smetLoot.mint(user1Address, 1, 10);
      
      // Check transaction was recorded
      const userTxCount = await transactionHistory.getUserTransactionCount(user1Address);
      expect(userTxCount).to.equal(1);
      
      const userTransactions = await transactionHistory.getUserTransactions(user1Address);
      const transaction = await transactionHistory.getTransaction(userTransactions[0]);
      
      expect(transaction.user).to.equal(user1Address);
      expect(transaction.contractAddress).to.equal(await smetLoot.getAddress());
      expect(transaction.action).to.equal('MINT');
      expect(transaction.amount).to.equal(10);
      expect(transaction.tokenId).to.equal(1);
    });
  });

  describe('Transaction Retrieval', function () {
    beforeEach(async function () {
      const user1Address = await user1.getAddress();
      
      // Create multiple transactions
      await smetGold.transfer(user1Address, ethers.parseEther('100'));
      await smetHero.mint(user1Address);
      await smetLoot.mint(user1Address, 1, 5);
    });

    it('Should get user transactions with pagination', async function () {
      const user1Address = await user1.getAddress();
      
      // Get first page
      const page1 = await transactionHistory.getUserTransactionsPaginated(user1Address, 0, 2);
      expect(page1.length).to.equal(2);
      
      // Get second page
      const page2 = await transactionHistory.getUserTransactionsPaginated(user1Address, 2, 2);
      expect(page2.length).to.equal(1);
    });

    it('Should return transactions in reverse chronological order', async function () {
      const user1Address = await user1.getAddress();
      
      const transactions = await transactionHistory.getUserTransactionsPaginated(user1Address, 0, 10);
      
      // Should be in reverse order (newest first)
      expect(transactions[0].action).to.equal('MINT'); // ERC1155 mint (last)
      expect(transactions[1].action).to.equal('MINT'); // ERC721 mint (second)
      expect(transactions[2].action).to.equal('TRANSFER'); // ERC20 transfer (first)
    });

    it('Should get total transaction count', async function () {
      const totalCount = await transactionHistory.getTotalTransactions();
      expect(totalCount).to.equal(3);
    });
  });

  describe('Multiple Users', function () {
    it('Should track transactions for multiple users separately', async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      
      // User1 transactions
      await smetGold.transfer(user1Address, ethers.parseEther('100'));
      await smetHero.mint(user1Address);
      
      // User2 transactions
      await smetGold.transfer(user2Address, ethers.parseEther('50'));
      
      // Check user1 transactions
      const user1Count = await transactionHistory.getUserTransactionCount(user1Address);
      expect(user1Count).to.equal(2);
      
      // Check user2 transactions
      const user2Count = await transactionHistory.getUserTransactionCount(user2Address);
      expect(user2Count).to.equal(1);
      
      // Check total
      const totalCount = await transactionHistory.getTotalTransactions();
      expect(totalCount).to.equal(3);
    });
  });

  describe('Events', function () {
    it('Should emit TransactionRecorded event', async function () {
      const user1Address = await user1.getAddress();
      
      await expect(smetGold.transfer(user1Address, ethers.parseEther('100')))
        .to.emit(transactionHistory, 'TransactionRecorded')
        .withArgs(0, await owner.getAddress(), await smetGold.getAddress(), 'TRANSFER', ethers.parseEther('100'), 0);
    });
  });
});