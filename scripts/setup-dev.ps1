Write-Host "Setting up Smet development environment..."

if (Test-Path -Path "package.json") {
  Write-Host "Installing root dependencies"
  npm install
}

if (Test-Path -Path "frontend") {
  Write-Host "Installing frontend dependencies"
  Push-Location frontend
  npm install
  Pop-Location
}

Write-Host "Done. Run 'cd frontend && npm run dev' to start the frontend."