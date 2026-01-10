#!/usr/bin/env bash
set -euo pipefail

# Helper: run Slither locally in CI-like environment (Linux/macOS)
# Installs slither and solc via py-solc-x and runs slither on the contracts folder.

python -m pip install --upgrade pip
pip install slither-analyzer py-solc-x
python - <<'PY'
from solcx import install_solc
install_solc('0.8.26')
PY

slither contract/contracts --solc-version 0.8.26
