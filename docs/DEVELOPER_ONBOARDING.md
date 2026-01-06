# Developer Onboarding Guide

Welcome to Smet — thanks for joining the project! This document provides a practical, step-by-step guide to get new developers productive as quickly as possible.

## Quick start (first 30–60 minutes)

1. Read this guide and the project README.md
2. Set up your local environment (Node.js, Git, VS Code recommended extensions)
3. Clone the repo and get dependencies installed:

   ```bash
   git clone git@github.com:victor-olamide/Smet.git
   cd Smet
   npm install
   cd frontend && npm install
   ```

4. Run the app locally:

   - Backend / Contracts: follow `docs/setup.md` to run local Hardhat node and deploy dev contracts
   - Frontend: `cd frontend && npm run dev`

5. Run tests:

   ```bash
   cd frontend
   npm test
   ```

## Repository layout

- `/contract` — Smart contracts, deployments, and tests
- `/frontend` — Next.js frontend (React, Wagmi integrations)
- `/docs` — Project documentation

## Typical development workflow

- Create a feature branch: `git checkout -b issue/<num>-short-description`
- Add focused commits with descriptive messages
- Add/update tests and docs
- Open a Pull Request describing the change and link to the issue
- Request review and iterate on feedback

## Local environment checklist

- Node.js (LTS) — install via nvm or installer
- Git — set up name/email and GitHub SSH key
- VS Code with recommended extensions (see `./.vscode/extensions.json`)
- Optional: Docker for consistent local tooling

## Running tests and CI

- Frontend tests: `cd frontend && npm test`
- E2E or integration workflows will be documented in `docs/` as they are introduced

## Where to get help

- Project maintainers: @victor-olamide, @DeborahOlaboye
- Open an issue tagged `help wanted`
- For fast feedback, ping on the project's GitHub discussions or chat (if available)

---

For more details, see the onboarding checklist and quick troubleshooting sections in `docs/ONBOARDING_CHECKLIST.md`.
