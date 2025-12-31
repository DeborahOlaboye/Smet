# User Examples

## Quick: Check tx status
1. Copy tx hash from the app
2. Go to Etherscan and paste the tx hash

## Advanced: run an example script (local)

This script demonstrates a non-browser way to call `open` using a private key and an RPC endpoint. Use carefully.

```js
// scripts/run-open.js
const { ethers } = require('ethers');
const SmetRewardAbi = require('../frontend/src/config/abis/SmetReward.json');

async function run() {
  const rpc = process.env.RPC_URL || 'https://sepolia.infura.io/v3/<key>';
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract('0xeF85822c30D194c2B2F7cC17223C64292Bfe611b', SmetRewardAbi, signer);

// Read a user's tier (0 = None, 1 = Bronze, 2 = Silver, 3 = Gold, 4 = Platinum)
const tier = await contract.getTierOf('0x...');
console.log('tier', tier.toString());
  const tx = await contract.open(true, { value: ethers.utils.parseEther('0.01') });
  console.log('tx hash:', tx.hash);
  const receipt = await tx.wait();
  console.log('receipt:', receipt.transactionHash);
}

run().catch(console.error);
```

> **Security:** Never commit private keys. Use environment variables and scripts only in trusted environments.
