import { expect } from "chai";
import { ethers } from "hardhat";
import { Timelock, SmetReward } from "../typechain-types";

describe("Timelock", function () {
  let timelock: Timelock;
  let owner: any;
  let proposer: any;
  let executor: any;
  let user: any;

  const DELAY = 24 * 60 * 60; // 24 hours

  beforeEach(async function () {
    [owner, proposer, executor, user] = await ethers.getSigners();

    // Deploy Timelock
    const Timelock = await ethers.getContractFactory("Timelock");
    timelock = await Timelock.deploy(DELAY);

    // Grant roles
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();

    await timelock.grantRole(PROPOSER_ROLE, proposer.address);
    await timelock.grantRole(EXECUTOR_ROLE, executor.address);
  });

  describe("Deployment", function () {
    it("Should set the correct delay", async function () {
      expect(await timelock.delay()).to.equal(DELAY);
    });

    it("Should grant admin role to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();
      expect(await timelock.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Transaction Queuing", function () {
    it("Should allow proposer to queue transactions", async function () {
      const target = ethers.ZeroAddress;
      const value = 0;
      const data = "0x";

      await expect(
        timelock.connect(proposer).queueTransaction(target, value, data)
      ).to.emit(timelock, "TransactionQueued");
    });

    it("Should not allow non-proposer to queue transactions", async function () {
      const target = ethers.ZeroAddress;
      const value = 0;
      const data = "0x";

      await expect(
        timelock.connect(user).queueTransaction(target, value, data)
      ).to.be.reverted;
    });
  });

  describe("Transaction Execution", function () {
    it("Should not allow execution before delay", async function () {
      const target = ethers.ZeroAddress;
      const value = 0;
      const data = "0x";

      const tx = await timelock.connect(proposer).queueTransaction(target, value, data);
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "TransactionQueued");
      const eta = event?.args?.eta;

      await expect(
        timelock.connect(executor).executeTransaction(target, value, data, eta)
      ).to.be.revertedWith("Transaction not ready");
    });

    it("Should allow execution after delay", async function () {
      const target = ethers.ZeroAddress;
      const value = 0;
      const data = "0x";

      const tx = await timelock.connect(proposer).queueTransaction(target, value, data);
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "TransactionQueued");
      const eta = event?.args?.eta;

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [DELAY + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        timelock.connect(executor).executeTransaction(target, value, data, eta)
      ).to.emit(timelock, "TransactionExecuted");
    });

    it("Should not allow execution of expired transactions", async function () {
      const target = ethers.ZeroAddress;
      const value = 0;
      const data = "0x";

      const tx = await timelock.connect(proposer).queueTransaction(target, value, data);
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "TransactionQueued");
      const eta = event?.args?.eta;

      // Fast forward time beyond expiration (7 days + delay)
      await ethers.provider.send("evm_increaseTime", [DELAY + 8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        timelock.connect(executor).executeTransaction(target, value, data, eta)
      ).to.be.revertedWith("Transaction expired");
    });
  });

  describe("Transaction Cancellation", function () {
    it("Should allow canceller to cancel queued transactions", async function () {
      const target = ethers.ZeroAddress;
      const value = 0;
      const data = "0x";

      const tx = await timelock.connect(proposer).queueTransaction(target, value, data);
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "TransactionQueued");
      const eta = event?.args?.eta;

      await expect(
        timelock.connect(owner).cancelTransaction(target, value, data, eta)
      ).to.emit(timelock, "TransactionCancelled");
    });
  });

  describe("Delay Updates", function () {
    it("Should allow admin to update delay", async function () {
      const newDelay = 48 * 60 * 60; // 48 hours

      await expect(
        timelock.connect(owner).updateDelay(newDelay)
      ).to.emit(timelock, "DelayChanged")
        .withArgs(DELAY, newDelay);

      expect(await timelock.delay()).to.equal(newDelay);
    });

    it("Should not allow invalid delay values", async function () {
      const tooShort = 30 * 60; // 30 minutes
      const tooLong = 31 * 24 * 60 * 60; // 31 days

      await expect(
        timelock.connect(owner).updateDelay(tooShort)
      ).to.be.revertedWith("Invalid delay");

      await expect(
        timelock.connect(owner).updateDelay(tooLong)
      ).to.be.revertedWith("Invalid delay");
    });
  });

  describe("Integration with SmetReward", function () {
    let smetReward: any;

    beforeEach(async function () {
      // This would require deploying SmetReward with proper parameters
      // Implementation depends on having the full contract setup
    });

    it("Should protect critical functions with timelock", async function () {
      // Test that critical functions can only be called by timelock
      // Implementation depends on having deployed contracts
    });
  });
});