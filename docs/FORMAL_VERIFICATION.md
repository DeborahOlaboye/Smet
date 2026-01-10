# Formal Verification Plan

This document outlines a pragmatic, incremental approach to add formal verification for critical contracts in the Smet repo.

## Goals
- Add automated checks in CI for formal/fuzz testing and symbolic proofs.
- Provide example harnesses that encode simple, meaningful properties (invariants, anti-conditions).
- Make it easy for contributors to add new properties and run verification locally.

## Tools and Rationale
- **Foundry (Forge)** — general-purpose testing framework; `forge prove` can be used to generate verification conditions and run SMT-based proofs (requires `z3`). Good for targeted proofs and property tests written in Solidity.
- **Echidna** — property-based fuzzing; quick to write harnesses and find counterexamples to asserted invariants.
- **Scribble** — instrumentation and lightweight runtime verification; useful for inserting `assert`/`invariant` checks.

## CI Integration (what we added)
- GitHub Actions workflow (`.github/workflows/formal-verification.yml`) that:
  - Installs Foundry and runs `forge test` (and optionally `forge prove` when `z3` is available).
  - Runs Echidna via Docker to fuzz harness contracts placed under `contract/contracts/test/`.

## Example harness (added)
- `contract/contracts/test/EchidnaSmetGold.sol` — demonstrates an Echidna harness that verifies a simple invariant: `totalSupply()` remains constant for the ERC20 token `SmetGold`.

## How to run locally
- Echidna (Linux/macOS):
  - `scripts/run-echidna.sh` (requires Docker installed locally) — runs Echidna on the test harness.
- Foundry:
  - Install Foundry: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
  - Run tests: `forge test`
  - Attempt proofs (if `z3` is available): `forge prove`

## Next steps / Recommended properties to add
- Invariants for SmetReward:
  - Prize selection never overflows and selected index is within `prizePool` bounds.
  - `refill` correctly increases contract-held ERC20 balances and cannot accidentally reduce them.
  - After `fulfillRandomWords`, the mapping `waiting[reqId]` is cleared.
- Add `Scribble` contracts to instrument safety checks during unit tests.

## Notes
- These initial artifacts are intentionally small and illustrative — they show how to integrate formal tooling. Writing complete formal proofs will be an iterative process and may require deeper modeling of Chainlink interactions (VRF) using mocks/stubs.
