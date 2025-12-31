# ADR 0001 — Chainlink VRF Integration

Decision: Use Chainlink VRF V2 Plus for provable randomness.

Context:
- Randomness needs to be cryptographically secure and verifiable.
- Chainlink VRF provides a widely-used solution with subscription model.

Consequences:
- Implement VRFConsumerBaseV2Plus integration in `SmetReward`.
- Store `keyHash`, `subId`, and `callbackGasLimit` as configurable parameters.
- Handle mapping of request ids to opener addresses.

