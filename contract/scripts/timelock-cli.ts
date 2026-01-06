#!/usr/bin/env node

import { ethers } from "hardhat";
import { TimelockManager } from "./timelock-manager";

interface CLIArgs {
  command: string;
  timelock?: string;
  target?: string;
  value?: string;
  data?: string;
  eta?: string;
  delay?: string;
  [key: string]: any;
}

class TimelockCLI {
  private manager: TimelockManager;

  constructor(timelockAddress: string) {
    this.manager = new TimelockManager(timelockAddress);
  }

  async initialize(timelockAddress: string) {
    await this.manager.initialize(timelockAddress);
  }

  async handleCommand(args: CLIArgs) {
    switch (args.command) {
      case "queue":
        await this.queueTransaction(args);
        break;
      case "execute":
        await this.executeTransaction(args);
        break;
      case "cancel":
        await this.cancelTransaction(args);
        break;
      case "queue-fee":
        await this.queueFeeUpdate(args);
        break;
      case "queue-mint":
        await this.queueMint(args);
        break;
      case "queue-vrf":
        await this.queueVRFUpdate(args);
        break;
      case "queue-uri":
        await this.queueURIUpdate(args);
        break;
      case "list":
        await this.listTransactions();
        break;
      case "help":
        this.showHelp();
        break;
      default:
        console.error(`Unknown command: ${args.command}`);
        this.showHelp();
    }
  }

  private async queueTransaction(args: CLIArgs) {
    if (!args.target || !args.data) {
      console.error("Missing required arguments: --target, --data");
      return;
    }

    const value = parseInt(args.value || "0");
    await this.manager.queueTransaction({
      target: args.target,
      value,
      data: args.data,
      description: args.description || "Manual transaction"
    });
  }

  private async executeTransaction(args: CLIArgs) {
    if (!args.target || !args.data || !args.eta) {
      console.error("Missing required arguments: --target, --data, --eta");
      return;
    }

    const value = parseInt(args.value || "0");
    const eta = parseInt(args.eta);
    
    await this.manager.executeTransaction(args.target, value, args.data, eta);
  }

  private async cancelTransaction(args: CLIArgs) {
    if (!args.target || !args.data || !args.eta) {
      console.error("Missing required arguments: --target, --data, --eta");
      return;
    }

    const value = parseInt(args.value || "0");
    const eta = parseInt(args.eta);
    
    await this.manager.cancelTransaction(args.target, value, args.data, eta);
  }

  private async queueFeeUpdate(args: CLIArgs) {
    if (!args.contract || !args.fee) {
      console.error("Missing required arguments: --contract, --fee");
      return;
    }

    await this.manager.queueFeeUpdate(args.contract, args.fee);
  }

  private async queueMint(args: CLIArgs) {
    if (!args.contract || !args.to || !args.amount) {
      console.error("Missing required arguments: --contract, --to, --amount");
      return;
    }

    await this.manager.queueMint(args.contract, args.to, args.amount);
  }

  private async queueVRFUpdate(args: CLIArgs) {
    if (!args.contract || !args.confirmations || !args.gasLimit || !args.numWords) {
      console.error("Missing required arguments: --contract, --confirmations, --gasLimit, --numWords");
      return;
    }

    await this.manager.queueVRFConfigUpdate(
      args.contract,
      parseInt(args.confirmations),
      parseInt(args.gasLimit),
      parseInt(args.numWords)
    );
  }

  private async queueURIUpdate(args: CLIArgs) {
    if (!args.contract || !args.uri) {
      console.error("Missing required arguments: --contract, --uri");
      return;
    }

    await this.manager.queueURIUpdate(args.contract, args.uri);
  }

  private async listTransactions() {
    await this.manager.listPendingTransactions();
  }

  private showHelp() {
    console.log(`
Timelock CLI - Manage timelock transactions

Usage: npx ts-node timelock-cli.ts [command] [options]

Commands:
  queue           Queue a transaction
  execute         Execute a queued transaction
  cancel          Cancel a queued transaction
  queue-fee       Queue a fee update
  queue-mint      Queue a token mint
  queue-vrf       Queue VRF config update
  queue-uri       Queue URI update
  list            List pending transactions
  help            Show this help

Options:
  --timelock      Timelock contract address
  --target        Target contract address
  --value         ETH value to send (default: 0)
  --data          Transaction data
  --eta           Execution timestamp
  --contract      Contract address for specific operations
  --fee           New fee amount (for fee updates)
  --to            Recipient address (for mints)
  --amount        Amount to mint
  --confirmations VRF request confirmations
  --gasLimit      VRF callback gas limit
  --numWords      VRF number of words
  --uri           New URI (for URI updates)

Examples:
  # Queue a fee update
  npx ts-node timelock-cli.ts queue-fee --timelock 0x123... --contract 0x456... --fee 0.01

  # Execute a transaction
  npx ts-node timelock-cli.ts execute --timelock 0x123... --target 0x456... --data 0x789... --eta 1234567890

  # List pending transactions
  npx ts-node timelock-cli.ts list --timelock 0x123...
    `);
  }
}

// Parse command line arguments
function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const parsed: CLIArgs = { command: args[0] || "help" };

  for (let i = 1; i < args.length; i += 2) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      parsed[key] = value;
    }
  }

  return parsed;
}

// Main execution
async function main() {
  const args = parseArgs();

  if (!args.timelock && args.command !== "help") {
    console.error("Missing required argument: --timelock");
    process.exit(1);
  }

  const cli = new TimelockCLI(args.timelock || "");
  
  if (args.timelock) {
    await cli.initialize(args.timelock);
  }
  
  await cli.handleCommand(args);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}