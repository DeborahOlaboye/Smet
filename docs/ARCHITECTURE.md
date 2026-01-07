# Architecture Overview

This document is a lightweight companion to the Technical Specification and focuses on component diagrams and data flows.

## Components
- Smart contracts: core business logic for reward distribution
- Chainlink VRF: randomness oracle
- Frontend: wallet connections and UI flows
- Management scripts: deploys, refills

## Data flows
- Open flow: user -> contract.open -> VRF -> fulfillRandomWords -> deliver
- Refill flow: operator approves tokens -> contract.refill

## Diagram (placeholder)
- Add an SVG/PNG diagram to `docs/images/architecture.png` showing Wallet -> Frontend -> Contract -> VRF Coordinator -> Token Contracts
