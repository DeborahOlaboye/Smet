import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Signer } from 'ethers';

describe('Token Contracts with Circuit Breakers', function () {
  let smetGold: any;
  let smetHero: any;
  let smetLoot: any;
  let owner: Signer;
  let user: Signer;
  let breaker: Signer;
  
  beforeEach(async function () {
    [owner, user, breaker] = await ethers.getSigners();
    
    const SmetGold = await ethers.getContractFactory('SmetGold');
    smetGold = await SmetGold.deploy();
    await smetGold.waitForDeployment();
    
    const SmetHero = await ethers.getContractFactory('SmetHero');
    smetHero = await SmetHero.deploy();
    await smetHero.waitForDeployment();
    
    const SmetLoot = await ethers.getContractFactory('SmetLoot');
    smetLoot = await SmetLoot.deploy();
    await smetLoot.waitForDeployment();
  });

  describe('SmetGold Circuit Breaker Integration', function () {
    it('Should prevent transfers when circuit is broken', async function () {
      const transferSelector = smetGold.interface.getFunction('transfer').selector;
      
      // Authorize breaker and break transfer circuit
      await smetGold.authorizeBreaker(await breaker.getAddress());
      await smetGold.connect(breaker).breakCircuit(transferSelector);
      
      // Transfer should fail
      await expect(
        smetGold.transfer(await user.getAddress(), ethers.parseEther('100'))
      ).to.be.revertedWith('Circuit breaker: function disabled');
      
      // Restore circuit and transfer should work
      await smetGold.restoreCircuit(transferSelector);
      await expect(
        smetGold.transfer(await user.getAddress(), ethers.parseEther('100'))
      ).to.not.be.reverted;
    });

    it('Should prevent approvals when circuit is broken', async function () {
      const approveSelector = smetGold.interface.getFunction('approve').selector;
      
      await smetGold.authorizeBreaker(await breaker.getAddress());
      await smetGold.connect(breaker).breakCircuit(approveSelector);
      
      await expect(
        smetGold.approve(await user.getAddress(), ethers.parseEther('100'))
      ).to.be.revertedWith('Circuit breaker: function disabled');
    });
  });

  describe('SmetHero Circuit Breaker Integration', function () {
    it('Should prevent minting when circuit is broken', async function () {
      const mintSelector = smetHero.interface.getFunction('mint').selector;
      
      await smetHero.authorizeBreaker(await breaker.getAddress());
      await smetHero.connect(breaker).breakCircuit(mintSelector);
      
      await expect(
        smetHero.mint(await user.getAddress())
      ).to.be.revertedWith('Circuit breaker: function disabled');
      
      // Restore and mint should work
      await smetHero.restoreCircuit(mintSelector);
      await expect(
        smetHero.mint(await user.getAddress())
      ).to.not.be.reverted;
    });

    it('Should prevent transfers when circuit is broken', async function () {
      // First mint a token
      await smetHero.mint(await owner.getAddress());
      
      const transferSelector = smetHero.interface.getFunction('transferFrom').selector;
      
      await smetHero.authorizeBreaker(await breaker.getAddress());
      await smetHero.connect(breaker).breakCircuit(transferSelector);
      
      await expect(
        smetHero.transferFrom(await owner.getAddress(), await user.getAddress(), 1)
      ).to.be.revertedWith('Circuit breaker: function disabled');
    });
  });

  describe('SmetLoot Circuit Breaker Integration', function () {
    it('Should prevent minting when circuit is broken', async function () {
      const mintSelector = smetLoot.interface.getFunction('mint').selector;
      
      await smetLoot.authorizeBreaker(await breaker.getAddress());
      await smetLoot.connect(breaker).breakCircuit(mintSelector);
      
      await expect(
        smetLoot.mint(await user.getAddress(), 1, 10)
      ).to.be.revertedWith('Circuit breaker: function disabled');
      
      // Restore and mint should work
      await smetLoot.restoreCircuit(mintSelector);
      await expect(
        smetLoot.mint(await user.getAddress(), 1, 10)
      ).to.not.be.reverted;
    });

    it('Should prevent transfers when circuit is broken', async function () {
      // First mint some tokens
      await smetLoot.mint(await owner.getAddress(), 1, 10);
      
      const transferSelector = smetLoot.interface.getFunction('safeTransferFrom').selector;
      
      await smetLoot.authorizeBreaker(await breaker.getAddress());
      await smetLoot.connect(breaker).breakCircuit(transferSelector);
      
      await expect(
        smetLoot.safeTransferFrom(await owner.getAddress(), await user.getAddress(), 1, 5, '0x')
      ).to.be.revertedWith('Circuit breaker: function disabled');
    });
  });
});