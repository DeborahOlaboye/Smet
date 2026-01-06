# PowerShell helper to run Foundry tests and Echidna (Windows)
if (-not (Get-Command forge -ErrorAction SilentlyContinue)) {
  Write-Host "Foundry (forge) not found; install with: curl -L https://foundry.paradigm.xyz | bash && foundryup"
} else {
  Push-Location contract
  forge test
  Pop-Location
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "Docker not available; skipping Echidna."
} else {
  docker run --rm -v "${PWD}":/project -w /project --entrypoint echidna-test trailofbits/echidna:latest `
    contract/contracts/test/EchidnaSmetGold.sol --contract EchidnaSmetGold --solc-version 0.8.26 || $true
}
