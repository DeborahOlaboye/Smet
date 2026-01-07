import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Signer } from 'ethers';

describe('EmergencyCircuitBreakerManager', function () {
  let manager: any;
  let mockContract: any;
  let owner: Signer;
  let operator: Signer;
  let user: Signer;
  
  beforeEach(async function () {
    [owner, operator, user] = await ethers.getSigners();
    
    const Manager = await ethers.getContractFactory('EmergencyCircuitBreakerManager');
    manager = await Manager.deploy();
    await manager.waitForDeployment();
    
    // Deploy a mock circuit breaker contract for testing
    const CircuitBreaker = await ethers.getContractFactory('CircuitBreaker');
    mockContract = await CircuitBreaker.deploy();
    await mockContract.waitForDeployment();
  });

  describe('Contract Registration', function () {
    it('Should register and deregister contracts', async function () {
      const contractAddress = await mockContract.getAddress();
      
      await manager.registerContract(contractAddress, 'TestContract');
      expect(await manager.getContractCount()).to.equal(1);
      
      const contractInfo = await manager.contracts(0);
      expect(contractInfo.contractAddress).to.equal(contractAddress);
      expect(contractInfo.name).to.equal('TestContract');
      expect(contractInfo.isActive).to.be.true;
      
      await manager.deregisterContract(contractAddress);
      expect(await manager.getContractCount()).to.equal(0);
    });

    it('Should only allow owner to register contracts', async function () {
      await expect(
        manager.connect(user).registerContract(await mockContract.getAddress(), 'TestContract')
      ).to.be.revertedWithCustomError(manager, 'OwnableUnauthorizedAccount');
    });

    it('Should not allow duplicate registrations', async function () {
      const contractAddress = await mockContract.getAddress();
      
      await manager.registerContract(contractAddress, 'TestContract');
      await expect(
        manager.registerContract(contractAddress, 'TestContract2')
      ).to.be.revertedWith('Already registered');
    });
  });

  describe('Emergency Operations', function () {
    const testSelector = '0xa9059cbb';

    beforeEach(async function () {
      await manager.registerContract(await mockContract.getAddress(), 'TestContract');
      await manager.addEmergencyOperator(await operator.getAddress());
    });

    it('Should allow emergency operators to break all circuits', async function () {
      await manager.connect(operator).emergencyBreakAll(testSelector);
      
      expect(await mockContract.isCircuitBroken(testSelector)).to.be.true;
    });

    it('Should only allow owner to restore all circuits', async function () {
      await manager.connect(operator).emergencyBreakAll(testSelector);
      
      await expect(
        manager.connect(operator).emergencyRestoreAll(testSelector)
      ).to.be.revertedWithCustomError(manager, 'OwnableUnauthorizedAccount');
      
      await manager.emergencyRestoreAll(testSelector);
      expect(await mockContract.isCircuitBroken(testSelector)).to.be.false;
    });

    it('Should emit events for emergency operations', async function () {
      await expect(manager.connect(operator).emergencyBreakAll(testSelector))
        .to.emit(manager, 'EmergencyBreakAll')
        .withArgs(await operator.getAddress());
      
      await expect(manager.emergencyRestoreAll(testSelector))
        .to.emit(manager, 'EmergencyRestoreAll')
        .withArgs(await owner.getAddress());
    });
  });

  describe('Operator Management', function () {
    it('Should add and remove emergency operators', async function () {
      await manager.addEmergencyOperator(await operator.getAddress());
      expect(await manager.emergencyOperators(await operator.getAddress())).to.be.true;
      
      await manager.removeEmergencyOperator(await operator.getAddress());
      expect(await manager.emergencyOperators(await operator.getAddress())).to.be.false;
    });

    it('Should only allow owner to manage operators', async function () {
      await expect(
        manager.connect(user).addEmergencyOperator(await operator.getAddress())
      ).to.be.revertedWithCustomError(manager, 'OwnableUnauthorizedAccount');
    });
  });
});