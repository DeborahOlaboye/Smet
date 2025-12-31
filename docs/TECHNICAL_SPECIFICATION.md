# Technical Specification — Smet Protocol

## Overview

This document describes the architecture and design decisions behind the Smet reward protocol. It is intended to be a single source of truth for maintainers, auditors, and integrators.

## Goals
- Provide a provably-fair, gas-efficient reward distribution mechanism.
- Keep the contract interface minimal and audit-friendly.
- Support multiple asset types (ERC20, ERC721, ERC1155).
- Offer a simple frontend integration layer for UX flows (connect → open → confirm).

---

## High-level architecture

Components:
- Smart Contracts (solidity) — `SmetReward`, `SmetGold`, `SmetHero`, `SmetLoot`
- Chainlink VRF (V2 Plus) — source of cryptographic randomness
- Frontend — Next.js + Wagmi (web3 adapters) + `useSmetReward` hook
- Deployment & automation — ignition deployments and `scripts/`

Sequence (open flow):
1. User connects wallet and calls `open()` on `SmetReward` (pays fee)
2. Contract requests randomness from Chainlink VRF coordinator
3. Coordinator calls back `fulfillRandomWords` with random words
4. Contract samples the CDF, chooses an index, and delivers the prize

---

## Contract design notes

### Weighted prize selection
- We store weights and compute a cumulative distribution function (CDF) at construction.
- Sampling: rnd[0] % totalWeight, pick first index r < cdf[i]
- Rationale: CDF sampling is simple and gas-efficient for modest prize pools; modulo bias is negligible for small pools.

### VRF integration
- Use VRF V2 Plus with `numWords >= 1`. We use the first word for selection and keep `numWords` configurable for possible future uses.
- We store a mapping `waiting[reqId] => opener` to associate a request with an opener address.

### Delivery & asset types
- Supports three assetType values:
  - 1 = ERC20 (transfer amount)
  - 2 = ERC721 (token id)
  - 3 = ERC1155 (token id, amount 1)
- Deliveries are done via safeTransfer for NFT transfers and `transfer` for ERC20.

### Security & checks
- Fee check: `require(msg.value == fee)` ensures the exact fee is paid.
- Receiver hooks for ERC721/ERC1155 implement the required selectors.
- Reentrancy: delivery functions are executed in a single flow after randomness — consider adding ReentrancyGuard on future extensions.

---

## Frontend integration

### Web3 layer
- Centralized `src/lib/web3` layer provides `useSmetReward()` hook, `SmetRewardService` helper and contract config.
- `useSmetReward` encapsulates prepare → write → wait flow using Wagmi hooks to keep components simple.

### UX considerations
- Show immediate tx hash after write, and final confirmation via wait hook.
- Use toasts to notify pending / success / error.

---

## Testing & auditability
- Unit tests for contracts covering sampling, delivery and VRF callback paths.
- Integration tests using local Hardhat node and mocked VRF coordinator.
- Add deterministic tests for CDF selection by seeding known random words.

---

## Operational concerns
- Gas tuning: `callbackGasLimit` should be conservative; complex delivery logic may require higher gas.
- VRF subscription management: document the process to fund and manage Chainlink subId.
- Observability: emit events (Opened, RewardOut) with indexed fields for easy querying.

---

## Extensibility & future work
- Support bulk-open or batched opens with gas amortization.
- Consider on-chain source-of-truth for prize inventory and automated replenishment.
- Add governance-controlled parameters for fees, weights, and prize updates via an admin role.

### Time-based rewards and cooldowns
- Admins can set a global per-user cooldown (seconds) to prevent rapid repeat opens and reward farming (`setCooldownSeconds`).
- Individual prizes can be configured with an `availableAfter` Unix timestamp which gates their availability; the selection logic will skip locked prizes at fulfillment time.

---

## References
- `contract/contracts/SmetReward.sol`
- `frontend/src/lib/web3/useSmetReward.ts`
- ADRs in `docs/ADRs/`

