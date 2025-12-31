# PowerShell helper to run Slither locally on Windows (requires Python 3.8+)
Set-StrictMode -Version Latest

python -m pip install --upgrade pip
pip install slither-analyzer py-solc-x
python - <<'PY'
from solcx import install_solc
install_solc('0.8.26')
PY

slither contract/contracts --solc-version 0.8.26
