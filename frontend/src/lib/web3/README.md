# Web3 Integration Layer

This folder contains helpers and hooks to interact with the Smet smart contracts:

- `useSmetReward()` — a React hook to prepare, write and wait for `open()` transactions.
- `SmetRewardService` — a small helper class for programmatic interactions and utilities.
- `getRewardContractConfig()` — locate your contract address & ABI.

Usage example:

```ts
import { useSmetReward } from '@/lib/web3';

const { openReward, isLoading } = useSmetReward();
```