import { ethers } from "hardhat";
import { EventLog } from "ethers";

interface ContractConfig {
  address: string;
  name: string;
  abi: any[];
}

interface EventData {
  contract: string;
  event: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  args: any;
}

class EventMonitor {
  private contracts: Map<string, ethers.Contract> = new Map();
  private eventHandlers: Map<string, (event: EventData) => void> = new Map();
  private isMonitoring: boolean = false;

  constructor(private provider: ethers.Provider) {}

  addContract(config: ContractConfig): void {
    const contract = new ethers.Contract(config.address, config.abi, this.provider);
    this.contracts.set(config.name, contract);
    console.log(`📝 Added contract ${config.name} at ${config.address}`);
  }

  onEvent(eventName: string, handler: (event: EventData) => void): void {
    this.eventHandlers.set(eventName, handler);
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    
    console.log("🔍 Starting event monitoring...");
    this.isMonitoring = true;

    for (const [contractName, contract] of this.contracts) {
      contract.on("*", async (event: EventLog) => {
        const block = await this.provider.getBlock(event.blockNumber);
        
        const eventData: EventData = {
          contract: contractName,
          event: event.fragment.name,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: block?.timestamp || 0,
          args: event.args
        };

        this.handleEvent(eventData);
      });
    }

    console.log("✅ Event monitoring started");
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    for (const [, contract] of this.contracts) {
      contract.removeAllListeners();
    }

    this.isMonitoring = false;
    console.log("⏹️ Event monitoring stopped");
  }

  private handleEvent(eventData: EventData): void {
    const eventKey = `${eventData.contract}.${eventData.event}`;
    const handler = this.eventHandlers.get(eventKey) || this.eventHandlers.get(eventData.event);

    if (handler) {
      handler(eventData);
    } else {
      this.defaultEventHandler(eventData);
    }
  }

  private defaultEventHandler(eventData: EventData): void {
    console.log(`📡 Event: ${eventData.contract}.${eventData.event}`);
    console.log(`   Block: ${eventData.blockNumber}`);
    console.log(`   Tx: ${eventData.transactionHash}`);
    console.log(`   Time: ${new Date(eventData.timestamp * 1000).toISOString()}`);
    console.log(`   Args:`, eventData.args);
  }

  async getHistoricalEvents(
    contractName: string,
    eventName: string,
    fromBlock: number = 0,
    toBlock: number | string = "latest"
  ): Promise<EventData[]> {
    const contract = this.contracts.get(contractName);
    if (!contract) throw new Error(`Contract ${contractName} not found`);

    const filter = contract.filters[eventName]();
    const events = await contract.queryFilter(filter, fromBlock, toBlock);

    const eventData: EventData[] = [];
    for (const event of events) {
      if (event instanceof EventLog) {
        const block = await this.provider.getBlock(event.blockNumber);
        eventData.push({
          contract: contractName,
          event: event.fragment.name,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: block?.timestamp || 0,
          args: event.args
        });
      }
    }

    return eventData;
  }
}

// Specific monitoring functions
class SmetEventMonitor extends EventMonitor {
  constructor(provider: ethers.Provider) {
    super(provider);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Reward events
    this.onEvent("Opened", (event) => {
      console.log(`🎲 Reward box opened by ${event.args.opener}`);
    });

    this.onEvent("RewardOut", (event) => {
      console.log(`🎁 Reward distributed: ${event.args.reward.assetType} token`);
    });

    // Token events
    this.onEvent("Transfer", (event) => {
      if (event.args.from === ethers.ZeroAddress) {
        console.log(`🪙 Tokens minted: ${ethers.formatEther(event.args.value)} to ${event.args.to}`);
      } else if (event.args.to === ethers.ZeroAddress) {
        console.log(`🔥 Tokens burned: ${ethers.formatEther(event.args.value)} from ${event.args.from}`);
      } else {
        console.log(`💸 Transfer: ${ethers.formatEther(event.args.value)} from ${event.args.from} to ${event.args.to}`);
      }
    });

    // NFT events
    this.onEvent("HeroMinted", (event) => {
      console.log(`🦸 Hero NFT minted: ID ${event.args.tokenId} to ${event.args.to}`);
    });

    // Pause events
    this.onEvent("Paused", (event) => {
      console.log(`⏸️ Contract paused by ${event.args.account}`);
    });

    this.onEvent("Unpaused", (event) => {
      console.log(`▶️ Contract unpaused by ${event.args.account}`);
    });

    // Timelock events
    this.onEvent("TransactionQueued", (event) => {
      console.log(`⏰ Transaction queued: ${event.args.txHash}`);
    });

    this.onEvent("TransactionExecuted", (event) => {
      console.log(`✅ Transaction executed: ${event.args.txHash}`);
    });
  }

  async setupContracts(): Promise<void> {
    // Contract addresses
    const contracts = [
      {
        address: "0xeF85822c30D194c2B2F7cC17223C64292Bfe611b",
        name: "SmetReward",
        abi: await this.getContractABI("SmetReward")
      },
      {
        address: "0x0A8862B2d93105b6BD63ee2c9343E7966872a3D2",
        name: "SmetGold",
        abi: await this.getContractABI("SmetGold")
      },
      {
        address: "0x877D1FDa6a6b668b79ca4A42388E0825667d233E",
        name: "SmetHero",
        abi: await this.getContractABI("SmetHero")
      },
      {
        address: "0xa5046538c6338DC8b52a22675338a4623D4B5475",
        name: "SmetLoot",
        abi: await this.getContractABI("SmetLoot")
      }
    ];

    for (const contract of contracts) {
      this.addContract(contract);
    }
  }

  private async getContractABI(contractName: string): Promise<any[]> {
    try {
      const artifact = await ethers.getContractFactory(contractName);
      return artifact.interface.fragments;
    } catch {
      // Fallback to basic ERC interfaces
      return [];
    }
  }
}

export { EventMonitor, SmetEventMonitor, EventData };