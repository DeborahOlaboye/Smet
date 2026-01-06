import { ethers } from "hardhat";

interface TimelockTransaction {
  target: string;
  value: number;
  data: string;
  description: string;
}

class TimelockManager {
  private timelock: any;
  private delay: number;

  constructor(timelockAddress: string, delay: number = 24 * 60 * 60) { // 24 hours default
    this.delay = delay;
  }

  async initialize(timelockAddress: string) {
    this.timelock = await ethers.getContractAt("Timelock", timelockAddress);
  }

  async queueTransaction(tx: TimelockTransaction): Promise<string> {
    console.log(`📝 Queuing transaction: ${tx.description}`);
    
    const txResponse = await this.timelock.queueTransaction(
      tx.target,
      tx.value,
      tx.data
    );
    
    const receipt = await txResponse.wait();
    const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
    const txHash = event?.args?.txHash;
    
    console.log(`✅ Transaction queued with hash: ${txHash}`);
    console.log(`⏰ ETA: ${new Date(Date.now() + this.delay * 1000).toISOString()}`);
    
    return txHash;
  }

  async executeTransaction(target: string, value: number, data: string, eta: number): Promise<void> {
    console.log(`🚀 Executing transaction...`);
    
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime < eta) {
      throw new Error(`Transaction not ready. Wait ${eta - currentTime} seconds.`);
    }
    
    await this.timelock.executeTransaction(target, value, data, eta);
    console.log(`✅ Transaction executed successfully`);
  }

  async cancelTransaction(target: string, value: number, data: string, eta: number): Promise<void> {
    console.log(`❌ Cancelling transaction...`);
    await this.timelock.cancelTransaction(target, value, data, eta);
    console.log(`✅ Transaction cancelled`);
  }

  // Helper functions for common operations
  async queueFeeUpdate(smetRewardAddress: string, newFee: string): Promise<string> {
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint256"],
      [ethers.utils.parseEther(newFee)]
    );
    
    return this.queueTransaction({
      target: smetRewardAddress,
      value: 0,
      data: `0x8b7afe2e${data.slice(2)}`, // updateFee function selector + data
      description: `Update SmetReward fee to ${newFee} ETH`
    });
  }

  async queueMint(tokenAddress: string, to: string, amount: string): Promise<string> {
    const data = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256"],
      [to, ethers.utils.parseEther(amount)]
    );
    
    return this.queueTransaction({
      target: tokenAddress,
      value: 0,
      data: `0x40c10f19${data.slice(2)}`, // mint function selector + data
      description: `Mint ${amount} tokens to ${to}`
    });
  }

  async queueVRFConfigUpdate(
    smetRewardAddress: string,
    requestConfirmations: number,
    callbackGasLimit: number,
    numWords: number
  ): Promise<string> {
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint16", "uint32", "uint32"],
      [requestConfirmations, callbackGasLimit, numWords]
    );
    
    return this.queueTransaction({
      target: smetRewardAddress,
      value: 0,
      data: `0x12345678${data.slice(2)}`, // updateVRFConfig function selector + data
      description: `Update VRF config: confirmations=${requestConfirmations}, gasLimit=${callbackGasLimit}, numWords=${numWords}`
    });
  }

  async queueURIUpdate(smetLootAddress: string, newURI: string): Promise<string> {
    const data = ethers.utils.defaultAbiCoder.encode(
      ["string"],
      [newURI]
    );
    
    return this.queueTransaction({
      target: smetLootAddress,
      value: 0,
      data: `0x02fe5305${data.slice(2)}`, // setURI function selector + data
      description: `Update SmetLoot URI to ${newURI}`
    });
  }

  async listPendingTransactions(): Promise<void> {
    console.log("📋 Pending timelock transactions:");
    // This would require tracking queued transactions
    // In production, you'd query events or maintain a database
  }
}

// Export for use in other scripts
export { TimelockManager };

// Example usage script
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Managing timelock with account:", deployer.address);

  // Deploy timelock if needed
  const Timelock = await ethers.getContractFactory("Timelock");
  const timelock = await Timelock.deploy(24 * 60 * 60); // 24 hour delay
  await timelock.deployed();
  
  console.log("Timelock deployed to:", timelock.address);

  const manager = new TimelockManager(timelock.address);
  await manager.initialize(timelock.address);

  // Example: Queue a fee update
  const smetRewardAddress = "0xeF85822c30D194c2B2F7cC17223C64292Bfe611b";
  await manager.queueFeeUpdate(smetRewardAddress, "0.01");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}