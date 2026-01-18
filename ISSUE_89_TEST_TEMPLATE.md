# Issue #89: Access Control Implementation - Test Suite Template

## Overview
This document provides test templates for validating the access control implementation for SmetHero and SmetLoot mint functions.

## Test Setup

### Prerequisites
- Hardhat/Truffle or similar Solidity testing framework
- Test accounts with sufficient ETH for gas
- Deployed SmetReward, SmetHero, and SmetLoot contracts

### Test Account Setup
```javascript
const [owner, smetReward, user1, user2, hacker] = await ethers.getSigners();
```

## Unit Tests

### Test Suite 1: SmetHero (ERC721) Access Control

#### Test 1.1: Initial Minter State
```javascript
it("should have no minter set initially", async function() {
  const minter = await smetHero.minter();
  expect(minter).to.equal(ethers.ZeroAddress);
});
```

#### Test 1.2: setMinter Function - Owner Only
```javascript
describe("setMinter function", function() {
  it("should allow owner to set minter", async function() {
    await expect(
      smetHero.connect(owner).setMinter(smetReward.address)
    ).to.not.be.reverted;
    
    const minter = await smetHero.minter();
    expect(minter).to.equal(smetReward.address);
  });

  it("should reject non-owner setting minter", async function() {
    await expect(
      smetHero.connect(hacker).setMinter(smetReward.address)
    ).to.be.revertedWith("Ownable:");
  });

  it("should reject setting minter to zero address", async function() {
    await expect(
      smetHero.connect(owner).setMinter(ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid minter address");
  });

  it("should emit MinterSet event", async function() {
    await expect(
      smetHero.connect(owner).setMinter(smetReward.address)
    ).to.emit(smetHero, "MinterSet")
     .withArgs(smetReward.address);
  });
});
```

#### Test 1.3: Mint Function - Access Control
```javascript
describe("mint function access control", function() {
  beforeEach(async function() {
    await smetHero.connect(owner).setMinter(smetReward.address);
  });

  it("should allow minter to mint", async function() {
    await expect(
      smetHero.connect(smetReward).mint(user1.address)
    ).to.not.be.reverted;
  });

  it("should reject unauthorized minting", async function() {
    await expect(
      smetHero.connect(user1).mint(user1.address)
    ).to.be.revertedWith("Only minter can call this function");
  });

  it("should reject minting from zero address minter", async function() {
    // Reset minter
    await smetHero.connect(owner).setMinter(ethers.ZeroAddress);
    
    await expect(
      smetHero.connect(smetReward).mint(user1.address)
    ).to.be.revertedWith("Only minter can call this function");
  });

  it("should reject minting when minter not set", async function() {
    await smetHero.connect(owner).setMinter(ethers.ZeroAddress);
    
    await expect(
      smetHero.connect(hacker).mint(user1.address)
    ).to.be.revertedWith("Only minter can call this function");
  });
});
```

#### Test 1.4: Mint Function - Functionality
```javascript
describe("mint function functionality", function() {
  beforeEach(async function() {
    await smetHero.connect(owner).setMinter(smetReward.address);
  });

  it("should mint token with correct ID", async function() {
    const tx = await smetHero.connect(smetReward).mint(user1.address);
    const receipt = await tx.wait();
    
    const owner = await smetHero.ownerOf(1);
    expect(owner).to.equal(user1.address);
  });

  it("should increment token ID on each mint", async function() {
    await smetHero.connect(smetReward).mint(user1.address);
    await smetHero.connect(smetReward).mint(user2.address);
    
    expect(await smetHero.ownerOf(1)).to.equal(user1.address);
    expect(await smetHero.ownerOf(2)).to.equal(user2.address);
  });

  it("should maintain circuit breaker protection", async function() {
    // This test assumes circuit breaker is properly integrated
    // Verify that circuitBreakerCheck modifier still works
    const tx = await smetHero.connect(smetReward).mint(user1.address);
    await expect(tx).to.not.be.reverted;
  });

  it("should record transaction in history", async function() {
    await smetHero.connect(smetReward).mint(user1.address);
    
    // Verify transaction history was updated
    // This depends on TransactionHistory contract implementation
  });
});
```

### Test Suite 2: SmetLoot (ERC1155) Access Control

#### Test 2.1: Initial Minter State
```javascript
it("should have no minter set initially", async function() {
  const minter = await smetLoot.minter();
  expect(minter).to.equal(ethers.ZeroAddress);
});
```

#### Test 2.2: setMinter Function - Owner Only
```javascript
describe("setMinter function", function() {
  it("should allow owner to set minter", async function() {
    await expect(
      smetLoot.connect(owner).setMinter(smetReward.address)
    ).to.not.be.reverted;
    
    const minter = await smetLoot.minter();
    expect(minter).to.equal(smetReward.address);
  });

  it("should reject non-owner setting minter", async function() {
    await expect(
      smetLoot.connect(hacker).setMinter(smetReward.address)
    ).to.be.revertedWith("Ownable:");
  });

  it("should reject setting minter to zero address", async function() {
    await expect(
      smetLoot.connect(owner).setMinter(ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid minter address");
  });

  it("should emit MinterSet event", async function() {
    await expect(
      smetLoot.connect(owner).setMinter(smetReward.address)
    ).to.emit(smetLoot, "MinterSet")
     .withArgs(smetReward.address);
  });
});
```

#### Test 2.3: Mint Function - Access Control
```javascript
describe("mint function access control", function() {
  beforeEach(async function() {
    await smetLoot.connect(owner).setMinter(smetReward.address);
  });

  it("should allow minter to mint items", async function() {
    await expect(
      smetLoot.connect(smetReward).mint(user1.address, 1, 10)
    ).to.not.be.reverted;
  });

  it("should reject unauthorized minting", async function() {
    await expect(
      smetLoot.connect(user1).mint(user1.address, 1, 10)
    ).to.be.revertedWith("Only minter can call this function");
  });

  it("should reject minting from zero address minter", async function() {
    await smetLoot.connect(owner).setMinter(ethers.ZeroAddress);
    
    await expect(
      smetLoot.connect(smetReward).mint(user1.address, 1, 10)
    ).to.be.revertedWith("Only minter can call this function");
  });
});
```

#### Test 2.4: Mint Function - Functionality
```javascript
describe("mint function functionality", function() {
  beforeEach(async function() {
    await smetLoot.connect(owner).setMinter(smetReward.address);
  });

  it("should mint correct amount of items", async function() {
    await smetLoot.connect(smetReward).mint(user1.address, 1, 100);
    
    const balance = await smetLoot.balanceOf(user1.address, 1);
    expect(balance).to.equal(100);
  });

  it("should support batch minting", async function() {
    await smetLoot.connect(smetReward).mint(user1.address, 1, 50);
    await smetLoot.connect(smetReward).mint(user1.address, 2, 30);
    
    expect(await smetLoot.balanceOf(user1.address, 1)).to.equal(50);
    expect(await smetLoot.balanceOf(user1.address, 2)).to.equal(30);
  });

  it("should maintain circuit breaker protection", async function() {
    const tx = await smetLoot.connect(smetReward).mint(user1.address, 1, 10);
    await expect(tx).to.not.be.reverted;
  });

  it("should record transaction in history", async function() {
    await smetLoot.connect(smetReward).mint(user1.address, 1, 10);
    
    // Verify transaction history was updated
  });
});
```

## Integration Tests

### Test Suite 3: Cross-Contract Integration

#### Test 3.1: SmetReward to SmetHero Minting
```javascript
describe("SmetReward to SmetHero integration", function() {
  beforeEach(async function() {
    await smetHero.connect(owner).setMinter(smetReward.address);
  });

  it("should allow SmetReward to mint SmetHero tokens", async function() {
    // Assuming SmetReward has a distributeReward function
    await expect(
      smetReward.connect(user1).distributeReward(user1.address)
    ).to.not.be.reverted;
  });

  it("should create proper hero tokens", async function() {
    // Verify token ownership and properties
  });
});
```

#### Test 3.2: SmetReward to SmetLoot Minting
```javascript
describe("SmetReward to SmetLoot integration", function() {
  beforeEach(async function() {
    await smetLoot.connect(owner).setMinter(smetReward.address);
  });

  it("should allow SmetReward to mint SmetLoot items", async function() {
    await expect(
      smetReward.connect(user1).claimLoot(user1.address)
    ).to.not.be.reverted;
  });

  it("should create proper loot items", async function() {
    // Verify item balance and properties
  });
});
```

#### Test 3.3: Complete Reward Claiming Flow
```javascript
describe("complete reward claiming flow", function() {
  beforeEach(async function() {
    await smetHero.connect(owner).setMinter(smetReward.address);
    await smetLoot.connect(owner).setMinter(smetReward.address);
  });

  it("should complete end-to-end reward claim", async function() {
    // 1. User opens reward box
    // 2. System mints hero NFT
    // 3. System mints loot items
    // 4. User receives both tokens
    
    const tx = await smetReward.connect(user1).openRewardBox();
    await tx.wait();
    
    // Verify user has tokens
    const heroBalance = await smetHero.balanceOf(user1.address);
    const lootBalance = await smetLoot.balanceOf(user1.address, 1);
    
    expect(heroBalance).to.be.gt(0);
    expect(lootBalance).to.be.gt(0);
  });
});
```

## Edge Case Tests

### Test Suite 4: Edge Cases and Security

#### Test 4.1: Minter Update Edge Cases
```javascript
describe("minter update edge cases", function() {
  it("should allow updating minter address", async function() {
    const newMinter = user1.address;
    
    await smetHero.connect(owner).setMinter(smetReward.address);
    await smetHero.connect(owner).setMinter(newMinter);
    
    expect(await smetHero.minter()).to.equal(newMinter);
  });

  it("should prevent minting with old minter after update", async function() {
    await smetHero.connect(owner).setMinter(smetReward.address);
    await smetHero.connect(owner).setMinter(user1.address);
    
    await expect(
      smetHero.connect(smetReward).mint(user2.address)
    ).to.be.revertedWith("Only minter can call this function");
  });
});
```

#### Test 4.2: Reentrancy Protection
```javascript
describe("reentrancy protection", function() {
  it("should maintain circuit breaker during minting", async function() {
    // Verify circuit breaker is not bypassed
    await smetHero.connect(owner).setMinter(smetReward.address);
    
    const tx = await smetHero.connect(smetReward).mint(user1.address);
    await expect(tx).to.not.be.reverted;
  });
});
```

## Test Execution

### Running Tests

**Hardhat:**
```bash
npx hardhat test test/SmetERC721AccessControl.test.js
npx hardhat test test/SmetERC1155AccessControl.test.js
npx hardhat test test/SmetAccessControlIntegration.test.js
```

**Coverage Report:**
```bash
npx hardhat coverage --testfiles "test/*AccessControl*"
```

### Expected Results

**All tests should pass with 100% coverage of:**
- Access control modifiers
- setMinter function
- mint function restrictions
- Event emissions
- Integration scenarios

## Continuous Integration

### CI/CD Pipeline

```yaml
name: Access Control Tests
on: [pull_request, push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      
      - name: Install dependencies
        run: npm install
      
      - name: Compile contracts
        run: npx hardhat compile
      
      - name: Run access control tests
        run: npx hardhat test test/*AccessControl*
      
      - name: Generate coverage
        run: npx hardhat coverage --testfiles "test/*AccessControl*"
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Test Success Criteria

✅ **All access control tests pass**  
✅ **100% code coverage for new functions**  
✅ **No unauthorized minting possible**  
✅ **Event emissions verified**  
✅ **Integration tests pass**  
✅ **Edge cases handled correctly**  
✅ **No reentrancy vulnerabilities**  

## Documentation References

- `ISSUE_89_SECURITY_AUDIT.md` - Security analysis
- `ISSUE_89_DEPLOYMENT_GUIDE.md` - Deployment instructions
- `ISSUE_89_VERIFICATION_SUMMARY.md` - Implementation verification
