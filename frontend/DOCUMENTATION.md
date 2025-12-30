# Frontend Documentation (Quick Reference)

This file highlights key frontend docs and contains screenshots.

## Getting started
See `../docs/setup.md` for full setup and troubleshooting steps.

## Component docs
See `../docs/components.md` and `../docs/` for component-specific markdown files.

### Wallet connection
The app now supports multiple wallet providers via `wagmi` connectors. Use the header `Connect Wallet` button to choose from available wallets (MetaMask, WalletConnect, etc.). See `../docs/components/WalletConnection.md` for details.

## API interactions
See `../docs/api.md` for how the frontend currently accesses mocked APIs and how to replace them.

### Web3 integration 🔧
A dedicated Web3 integration layer lives under `src/lib/web3` and provides:

- `useSmetReward()` — a hook that encapsulates the prepare/write/wait flow for the `SmetReward` contract.
- `SmetRewardService` — a small helper for programmatic interactions and utility helpers.
- `getRewardContractConfig()` — contract address/ABI resolution centralised in one place.

Use `useRewardContract()` (legacy wrapper) or `useSmetReward()` directly from the new layer.

## Contribution
See `../docs/contributing.md` for the frontend contribution workflow and checklist.

## Screenshots

![App screenshot 1](/docs/images/screenshot-1.svg)

![App screenshot 2](/docs/images/screenshot-2.svg)

> Replace the screenshots in `/docs/images/` with real app screenshots.
