#!/usr/bin/env bash
set -euo pipefail

echo "Setting up Smet development environment..."

# Install root dependencies
if [ -f package.json ]; then
  echo "Installing root dependencies"
  npm install
fi

# Install frontend dependencies
if [ -d frontend ]; then
  echo "Installing frontend dependencies"
  (cd frontend && npm install)
fi

echo "Done. Run 'cd frontend && npm run dev' to start the frontend."