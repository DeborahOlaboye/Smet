# ADR 0002 — Use CDF-based sampling for weighted rewards

Decision: Use cumulative distribution function (CDF) built at contract construction.

Context:
- Need to support weighted probabilities for reward selection.
- Simplicity and gas-efficiency are required.

Consequences:
- Convert weights -> cdf in constructor and store as uint32[]
- Sample via random % total and linear scan to find index
- Note: acceptable modulo bias for small pools; revisit for very large pools
