# Reward Tiering

This document describes the newly added `SmetTiers` contract and how it integrates with `SmetReward`.

## Overview

- `SmetTiers` is a small, owner-configurable contract that computes a user's tier (None/Bronze/Silver/Gold/Platinum) based on staking balances in `SmetStaking`.
- Thresholds are configurable by the contract owner and must be non-decreasing.
- `SmetReward` can optionally be configured with the address of a `SmetTiers` contract; this enables UIs and integrations to query a user's tier via the `getTierOf(address)` view function.

## Usage

1. Deploy `SmetTiers` with initial thresholds.
2. Call `setStakingContract` with the deployed `SmetStaking` contract.
3. Optionally call `setTiersContract` on `SmetReward` to point it to the deployed `SmetTiers` contract.
4. Clients can call `SmetReward.getTierOf(address)` (or `SmetTiers.getTierId`) to obtain the numeric tier (0 = None, 1 = Bronze, ...).

## Notes

- The current implementation computes tiers only from staking balances. Extensibility points include adding token-holding or activity-based scoring.
- Tests are included in `contracts/SmetTiers.t.sol`.
