#!/usr/bin/env node

import { ethers } from 'hardhat';
import { Command } from 'commander';

const program = new Command();

program
  .name('circuit-breaker-cli')
  .description('CLI tool for managing circuit breakers')
  .version('1.0.0');

program
  .command('break')
  .description('Break a circuit for a specific function')
  .requiredOption('-c, --contract <address>', 'Contract address')
  .requiredOption('-f, --function <selector>', 'Function selector (e.g., 0xa9059cbb)')
  .action(async (options) => {
    try {
      const [signer] = await ethers.getSigners();
      const contract = await ethers.getContractAt('CircuitBreaker', options.contract);
      
      const tx = await contract.breakCircuit(options.function);
      await tx.wait();
      
      console.log(`✅ Circuit broken for function ${options.function}`);
      console.log(`Transaction hash: ${tx.hash}`);
    } catch (error) {
      console.error('❌ Error breaking circuit:', error);
    }
  });

program
  .command('restore')
  .description('Restore a circuit for a specific function')
  .requiredOption('-c, --contract <address>', 'Contract address')
  .requiredOption('-f, --function <selector>', 'Function selector (e.g., 0xa9059cbb)')
  .action(async (options) => {
    try {
      const [signer] = await ethers.getSigners();
      const contract = await ethers.getContractAt('CircuitBreaker', options.contract);
      
      const tx = await contract.restoreCircuit(options.function);
      await tx.wait();
      
      console.log(`✅ Circuit restored for function ${options.function}`);
      console.log(`Transaction hash: ${tx.hash}`);
    } catch (error) {
      console.error('❌ Error restoring circuit:', error);
    }
  });

program
  .command('status')
  .description('Check circuit breaker status')
  .requiredOption('-c, --contract <address>', 'Contract address')
  .option('-f, --function <selector>', 'Function selector to check')
  .action(async (options) => {
    try {
      const contract = await ethers.getContractAt('CircuitBreaker', options.contract);
      
      if (options.function) {
        const isBroken = await contract.isCircuitBroken(options.function);
        console.log(`Function ${options.function}: ${isBroken ? '🔴 BROKEN' : '🟢 OK'}`);
      } else {
        // Check common functions
        const commonFunctions = {
          'transfer': '0xa9059cbb',
          'transferFrom': '0x23b872dd',
          'approve': '0x095ea7b3',
          'mint': '0x40c10f19',
          'safeTransferFrom': '0x42842e0e'
        };
        
        console.log(`Circuit Breaker Status for ${options.contract}:`);
        console.log('='.repeat(50));
        
        for (const [name, selector] of Object.entries(commonFunctions)) {
          try {
            const isBroken = await contract.isCircuitBroken(selector);
            console.log(`${name.padEnd(15)}: ${isBroken ? '🔴 BROKEN' : '🟢 OK'}`);
          } catch (error) {
            console.log(`${name.padEnd(15)}: ⚪ N/A`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking status:', error);
    }
  });

program
  .command('emergency-break-all')
  .description('Emergency break all circuits for a function across all registered contracts')
  .requiredOption('-m, --manager <address>', 'Emergency manager contract address')
  .requiredOption('-f, --function <selector>', 'Function selector (e.g., 0xa9059cbb)')
  .action(async (options) => {
    try {
      const [signer] = await ethers.getSigners();
      const manager = await ethers.getContractAt('EmergencyCircuitBreakerManager', options.manager);
      
      const tx = await manager.emergencyBreakAll(options.function);
      await tx.wait();
      
      console.log(`🚨 Emergency break executed for function ${options.function}`);
      console.log(`Transaction hash: ${tx.hash}`);
    } catch (error) {
      console.error('❌ Error executing emergency break:', error);
    }
  });

program.parse();