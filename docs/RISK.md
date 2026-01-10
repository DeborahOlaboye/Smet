# Risk Assessment

## Identified Risks
- VRF Request/Response failures: monitor for unfulfilled requests and implement retries
- Token delivery failures (low approvals, transfer reverts): provide operator tooling for refills
- Gas spikes causing tx issues: document recommended retries and emergency procedures

## Mitigations
- Emit events and provide off-chain monitoring for pending requests
- Alerting on unusually high requestConfirmations or reverts
- Operational runbooks for refilling and managing Chainlink subscription
