# Web3 Integration Layer

This folder contains helpers and hooks to interact with the Smet smart contracts:

- `useSmetReward()` — a React hook to prepare, write and wait for `open()` transactions. Note: `open()` now accepts a `paymentInNative` boolean; the hook prepares this argument for you.
- `SmetRewardService` — a small helper class for programmatic interactions and utilities.
- `getRewardContractConfig()` — locate your contract address & ABI.

Usage example:

```ts
import { useSmetReward } from '@/lib/web3';

const { openReward, isLoading } = useSmetReward({ poolId: 0 });

// Example ethers.js usage
// const reward = new ethers.Contract(address, abi, signer);
// await reward.open(true, 0, { value: ethers.utils.parseEther('0.01') });
```