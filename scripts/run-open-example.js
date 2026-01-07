#!/usr/bin/env node
const { ethers } = require('ethers');
const SmetRewardAbi = require('../frontend/src/config/abis/SmetReward.json');

async function main() {
  const rpc = process.env.RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  if (!rpc || !pk) {
    console.error('Please set RPC_URL and PRIVATE_KEY');
    process.exit(1);
  }
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const signer = new ethers.Wallet(pk, provider);
  const contract = new ethers.Contract('0xeF85822c30D194c2B2F7cC17223C64292Bfe611b', SmetRewardAbi, signer);

  const tx = await contract.open(true, { value: ethers.utils.parseEther('0.01') });
  console.log('Sent tx:', tx.hash);
  await tx.wait();
  console.log('Mined');
}

main().catch(err => { console.error(err); process.exit(1); });