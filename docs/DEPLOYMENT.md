# Deployment & Operational Notes

## Deploying contracts
- Use `contract/ignition` to deploy to sepolia or mainnet; update `deployments` accordingly
- Confirm addresses in `README.md` and `frontend/src/config/contracts.ts`

## Refilling tokens and subscriptions
- For ERC20 prizes, call `refill(token, amount)` after approving the contract
- Manage Chainlink subscription via the Chainlink dashboard and ensure `subId` funding

## Rollback / upgrade
- Contracts are not upgradeable; deploy a new version and migrate state if necessary
