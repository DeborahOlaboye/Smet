import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Signer } from 'ethers';

describe('CircuitBreaker', function () {
  let circuitBreaker: any;
  let owner: Signer;
  let breaker: Signer;
  let user: Signer;
  
  beforeEach(async function () {
    [owner, breaker, user] = await ethers.getSigners();
    
    const CircuitBreaker = await ethers.getContractFactory('CircuitBreaker');
    circuitBreaker = await CircuitBreaker.deploy();
    await circuitBreaker.waitForDeployment();
  });

  describe('Authorization', function () {
    it('Should authorize and revoke breakers', async function () {
      await circuitBreaker.authorizeBreaker(await breaker.getAddress());
      expect(await circuitBreaker.isAuthorizedBreaker(await breaker.getAddress())).to.be.true;
      
      await circuitBreaker.revokeBreaker(await breaker.getAddress());
      expect(await circuitBreaker.isAuthorizedBreaker(await breaker.getAddress())).to.be.false;
    });

    it('Should only allow owner to authorize breakers', async function () {
      await expect(
        circuitBreaker.connect(user).authorizeBreaker(await breaker.getAddress())
      ).to.be.revertedWithCustomError(circuitBreaker, 'OwnableUnauthorizedAccount');
    });
  });

  describe('Circuit Breaking', function () {
    const testSelector = '0xa9059cbb'; // transfer function selector

    it('Should break and restore circuits', async function () {
      await circuitBreaker.authorizeBreaker(await breaker.getAddress());
      
      await circuitBreaker.connect(breaker).breakCircuit(testSelector);
      expect(await circuitBreaker.isCircuitBroken(testSelector)).to.be.true;
      
      await circuitBreaker.restoreCircuit(testSelector);
      expect(await circuitBreaker.isCircuitBroken(testSelector)).to.be.false;
    });

    it('Should only allow authorized breakers to break circuits', async function () {
      await expect(
        circuitBreaker.connect(user).breakCircuit(testSelector)
      ).to.be.revertedWith('Unauthorized');
    });

    it('Should only allow owner to restore circuits', async function () {
      await circuitBreaker.authorizeBreaker(await breaker.getAddress());
      await circuitBreaker.connect(breaker).breakCircuit(testSelector);
      
      await expect(
        circuitBreaker.connect(breaker).restoreCircuit(testSelector)
      ).to.be.revertedWithCustomError(circuitBreaker, 'OwnableUnauthorizedAccount');
    });

    it('Should emit events when breaking and restoring circuits', async function () {
      await circuitBreaker.authorizeBreaker(await breaker.getAddress());
      
      await expect(circuitBreaker.connect(breaker).breakCircuit(testSelector))
        .to.emit(circuitBreaker, 'CircuitBroken')
        .withArgs(testSelector, await breaker.getAddress());
      
      await expect(circuitBreaker.restoreCircuit(testSelector))
        .to.emit(circuitBreaker, 'CircuitRestored')
        .withArgs(testSelector, await owner.getAddress());
    });
  });
});