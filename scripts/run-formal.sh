#!/usr/bin/env bash
set -euo pipefail

# Local helper: run Foundry tests and Echidna (Echidna requires Docker)

# Foundry
if ! command -v forge >/dev/null 2>&1; then
  echo "Foundry (forge) not found; install it with: curl -L https://foundry.paradigm.xyz | bash && foundryup"
else
  (cd contract && forge test)
fi

# Echidna
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not available; skipping Echidna."
else
  docker run --rm -v "$(pwd)":/project -w /project --entrypoint echidna-test trailofbits/echidna:latest \
    contract/contracts/test/EchidnaSmetGold.sol --contract EchidnaSmetGold --solc-version 0.8.26 || true
fi
