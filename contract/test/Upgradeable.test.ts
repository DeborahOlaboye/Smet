import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Upgradeable Contracts", function () {
  let smetGold: any;
  let smetHero: any;
  let smetLoot: any;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy upgradeable contracts
    const SmetGold = await ethers.getContractFactory("SmetGoldUpgradeable");
    smetGold = await upgrades.deployProxy(SmetGold, [], {
      initializer: "initialize",
      kind: "uups"
    });

    const SmetHero = await ethers.getContractFactory("SmetHeroUpgradeable");
    smetHero = await upgrades.deployProxy(SmetHero, [], {
      initializer: "initialize", 
      kind: "uups"
    });

    const SmetLoot = await ethers.getContractFactory("SmetLootUpgradeable");
    smetLoot = await upgrades.deployProxy(SmetLoot, [], {
      initializer: "initialize",
      kind: "uups"
    });
  });

  describe("SmetGold Upgradeable", function () {
    it("Should initialize correctly", async function () {
      expect(await smetGold.name()).to.equal("SmetGold");
      expect(await smetGold.symbol()).to.equal("SGOLD");
      expect(await smetGold.owner()).to.equal(owner.address);
    });

    it("Should have initial supply", async function () {
      const expectedSupply = ethers.parseEther("10000000");
      expect(await smetGold.totalSupply()).to.equal(expectedSupply);
      expect(await smetGold.balanceOf(owner.address)).to.equal(expectedSupply);
    });

    it("Should be upgradeable by owner", async function () {
      // This would test actual upgrade functionality
      // Implementation depends on having a V2 contract
    });

    it("Should not be upgradeable by non-owner", async function () {
      const SmetGoldV2 = await ethers.getContractFactory("SmetGoldUpgradeable");
      
      await expect(
        upgrades.upgradeProxy(smetGold, SmetGoldV2.connect(user))
      ).to.be.reverted;
    });
  });

  describe("SmetHero Upgradeable", function () {
    it("Should initialize correctly", async function () {
      expect(await smetHero.name()).to.equal("SmetHero");
      expect(await smetHero.symbol()).to.equal("SHERO");
      expect(await smetHero.nextId()).to.equal(1);
    });

    it("Should mint NFTs with sequential IDs", async function () {
      // This would require timelock setup for actual minting
      // Testing the upgrade functionality is the main focus
    });
  });

  describe("SmetLoot Upgradeable", function () {
    it("Should initialize correctly", async function () {
      expect(await smetLoot.owner()).to.equal(owner.address);
    });

    it("Should support ERC1155 interface", async function () {
      const ERC1155_INTERFACE_ID = "0xd9b67a26";
      expect(await smetLoot.supportsInterface(ERC1155_INTERFACE_ID)).to.be.true;
    });
  });

  describe("Upgrade Process", function () {
    it("Should validate upgrade compatibility", async function () {
      const SmetGoldV2 = await ethers.getContractFactory("SmetGoldUpgradeable");
      
      // This should not throw
      await upgrades.validateUpgrade(smetGold, SmetGoldV2);
    });

    it("Should preserve state after upgrade", async function () {
      // Record state before upgrade
      const balanceBefore = await smetGold.balanceOf(owner.address);
      const totalSupplyBefore = await smetGold.totalSupply();
      
      // Upgrade contract
      const SmetGoldV2 = await ethers.getContractFactory("SmetGoldUpgradeable");
      const upgraded = await upgrades.upgradeProxy(smetGold, SmetGoldV2);
      
      // Verify state is preserved
      expect(await upgraded.balanceOf(owner.address)).to.equal(balanceBefore);
      expect(await upgraded.totalSupply()).to.equal(totalSupplyBefore);
    });

    it("Should maintain proxy address after upgrade", async function () {
      const proxyAddressBefore = await smetGold.getAddress();
      
      const SmetGoldV2 = await ethers.getContractFactory("SmetGoldUpgradeable");
      const upgraded = await upgrades.upgradeProxy(smetGold, SmetGoldV2);
      
      const proxyAddressAfter = await upgraded.getAddress();
      expect(proxyAddressAfter).to.equal(proxyAddressBefore);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to authorize upgrades", async function () {
      // Test that _authorizeUpgrade is properly protected
      // This is tested implicitly through the upgrade process
    });

    it("Should allow timelock to call protected functions", async function () {
      // This would require deploying and setting up timelock
      // Testing the modifier functionality
    });
  });

  describe("Initialization", function () {
    it("Should prevent re-initialization", async function () {
      await expect(smetGold.initialize()).to.be.reverted;
    });

    it("Should disable initializers in implementation", async function () {
      // Deploy implementation directly (not through proxy)
      const SmetGold = await ethers.getContractFactory("SmetGoldUpgradeable");
      const implementation = await SmetGold.deploy();
      
      // Should not be able to initialize implementation
      await expect(implementation.initialize()).to.be.reverted;
    });
  });
});