import { ethers } from 'hardhat';
import { EventLog } from 'ethers';

interface CircuitBreakerEvent {
  functionSelector: string;
  breaker: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

class CircuitBreakerMonitor {
  private contracts: Map<string, ethers.Contract> = new Map();
  
  async addContract(name: string, address: string, abi: any[]) {
    const contract = await ethers.getContractAt(abi, address);
    this.contracts.set(name, contract);
    
    // Listen for circuit breaker events
    contract.on('CircuitBroken', (functionSelector: string, breaker: string, event: EventLog) => {
      this.handleCircuitBroken(name, functionSelector, breaker, event);
    });
    
    contract.on('CircuitRestored', (functionSelector: string, restorer: string, event: EventLog) => {
      this.handleCircuitRestored(name, functionSelector, restorer, event);
    });
  }
  
  private async handleCircuitBroken(contractName: string, functionSelector: string, breaker: string, event: EventLog) {
    const block = await event.getBlock();
    const eventData: CircuitBreakerEvent = {
      functionSelector,
      breaker,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      timestamp: block.timestamp
    };
    
    console.log(`🚨 CIRCUIT BROKEN - ${contractName}`);
    console.log(`Function: ${functionSelector}`);
    console.log(`Breaker: ${breaker}`);
    console.log(`Block: ${eventData.blockNumber}`);
    console.log(`Time: ${new Date(eventData.timestamp * 1000).toISOString()}`);
    console.log('---');
  }
  
  private async handleCircuitRestored(contractName: string, functionSelector: string, restorer: string, event: EventLog) {
    const block = await event.getBlock();
    const eventData: CircuitBreakerEvent = {
      functionSelector,
      breaker: restorer,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      timestamp: block.timestamp
    };
    
    console.log(`✅ CIRCUIT RESTORED - ${contractName}`);
    console.log(`Function: ${functionSelector}`);
    console.log(`Restorer: ${restorer}`);
    console.log(`Block: ${eventData.blockNumber}`);
    console.log(`Time: ${new Date(eventData.timestamp * 1000).toISOString()}`);
    console.log('---');
  }
  
  async checkAllCircuitStatus() {
    console.log('Circuit Breaker Status Report');
    console.log('============================');
    
    for (const [name, contract] of this.contracts) {
      console.log(`\n${name}:`);
      
      // Check common function selectors
      const selectors = [
        '0xa9059cbb', // transfer
        '0x23b872dd', // transferFrom
        '0x095ea7b3', // approve
        '0x40c10f19', // mint
        '0x42842e0e', // safeTransferFrom
      ];
      
      for (const selector of selectors) {
        try {
          const isBroken = await contract.isCircuitBroken(selector);
          if (isBroken) {
            console.log(`  🔴 ${selector}: BROKEN`);
          } else {
            console.log(`  🟢 ${selector}: OK`);
          }
        } catch (error) {
          console.log(`  ⚪ ${selector}: N/A`);
        }
      }
    }
  }
}

export { CircuitBreakerMonitor };