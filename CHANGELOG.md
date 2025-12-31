# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Add `SmetTiers` contract for configurable reward tiers (Bronze/Silver/Gold/Platinum).
- Expose `getTierOf(address)` on `SmetReward` and add UI tier badge in the frontend.
- Implement time-based prize availability and per-user cooldowns to combat reward farming (admin-settable via `setCooldownSeconds` and `setPrizeAvailableAfter`).
- Add multi-pool support to `SmetReward`: multiple pools may be created with independent fees, weights and prize sets; users call `open(paymentInNative, poolId)` to open a specific pool.
