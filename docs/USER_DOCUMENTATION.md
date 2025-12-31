# User Documentation — Interacting with Smet Contracts

This guide explains how end users can interact with Smet smart contracts, either through the frontend UI or directly via wallets and developer tools.

## Overview

Smet provides a frontend experience for connecting wallets and opening rewards via the `SmetReward` smart contract. This document covers:

- How to connect a wallet
- How to use the app UI to open rewards
- How to verify transactions on Etherscan
- How to interact directly with contracts (via Etherscan, ethers.js, or CLI)
- Troubleshooting common issues for users

---

## Connect your wallet

1. Click `Connect Wallet` in the app header.
2. Choose your provider (MetaMask, WalletConnect, etc.).
3. Approve the connection in your wallet. Make sure your wallet is set to the correct network (e.g., Sepolia or the network indicated in the app).

> Tip: If no wallets appear, ensure a supported provider is installed/enabled in your browser or use WalletConnect to connect from a mobile wallet.

---

## Opening rewards via the UI

1. After connecting, navigate to the rewards page.
2. Select a reward box and click `Open`.
3. Confirm the transaction in your wallet. You will see a pending status until the transaction is mined.
4. When opening a reward, you may select a specific pool (if multiple pools are configured). The contract method signature is `open(paymentInNative, poolId)` where `poolId` is an integer (default 0).
5. After confirmation, the app will display the result (which token you won).

---

## Verify transactions on Etherscan

1. Open Etherscan for the network in use (Sepolia or your network host).
2. Paste your transaction hash into the search and inspect the transaction details.
3. For contract addresses, use the contract's Etherscan page to explore read/write functions and events.

**Known deployed addresses (Sepolia)**
- SmetReward: `0xeF85822c30D194c2B2F7cC17223C64292Bfe611b`

- Reward tiers: The system now supports optional reward tiers via a `SmetTiers` contract which can be configured on `SmetReward`. Clients can call `getTierOf(address)` to read a user's tier (0 = None, 1 = Bronze, 2 = Silver, 3 = Gold, 4 = Platinum).
- SmetHero, SmetLoot, SmetGold: see `README.md` or `contract/ignition/deployments/sepolia-deployment/deployed_addresses.json`

Admin features:
- Admins can set a global cooldown (seconds) via `setCooldownSeconds(uint256)` to limit how frequently a user can call `open()` and help prevent reward farming.
- Admins can also schedule when individual prizes become available using `setPrizeAvailableAfter(uint256 idx, uint64 availableAfter)`.

---

## Interacting with contracts directly (advanced users)

### Etherscan write (quick)
1. Navigate to the contract's Etherscan page and click `Write Contract`.
2. Connect your wallet in Etherscan (via the UI) and call `open` with the proper args (if needed) and ETH value.

### Example: ethers.js script (programmatic)

```js
// scripts/open-reward.js
import { ethers } from 'ethers';
import SmetRewardAbi from '../frontend/src/config/abis/SmetReward.json';

async function main() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();

  const reward = new ethers.Contract('0xeF85822c30D194c2B2F7cC17223C64292Bfe611b', SmetRewardAbi, signer);
  const tx = await reward.open(true, { value: ethers.utils.parseEther('0.01') });
  console.log('Sent transaction:', tx.hash);
  const receipt = await tx.wait();
  console.log('Mined:', receipt.transactionHash);
}

main().catch(console.error);
```

> Note: Always review the contract ABI and expected function arguments. The UI abstracts most of this for you.

---

## Troubleshooting & FAQ

- Transaction stuck/pending: Check gas price settings and look up your tx on Etherscan. If gas is too low, you may need to speed up the tx via your wallet.
- Wallet not connecting: Ensure you are on a supported network and that your wallet provider is enabled in the browser.
- I received an incorrect result: Open an issue and include the tx hash, screenshots, and explanation.

---

## Security & safety
- Never share private keys.
- Verify contract addresses before sending transactions.
- Use small test transactions if unsure.

---

For more developer-focused documentation, see `docs/DEVELOPER_ONBOARDING.md` and `frontend/src/lib/web3/README.md`.
