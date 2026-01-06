# Test Plan for Smet Protocol

## Unit tests
- Contracts: test CDF sampling, VRF callback handling, delivery paths, refill
- Frontend: test hooks (`useSmetReward`), contexts, and components mocking wagmi

## Integration tests
- Local Hardhat node with a mock VRF coordinator to emulate request/response
- E2E flow: deploy contracts to local network, seed tokens, run a transaction and verify delivery

## Audit checklist
- Edge cases for array lengths, overflows, and zero address handling
- Reentrancy analysis for delivery functions
- Gas profiling for `fulfillRandomWords` and `_deliver`
