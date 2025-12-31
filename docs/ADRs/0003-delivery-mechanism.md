# ADR 0003 — Reward Delivery Mechanism

Decision: Support ERC20/ERC721/ERC1155 and deliver via standard transfers.

Context:
- Rewards can be fungible or non-fungible; must be transferred securely.

Consequences:
- Use `transfer` for ERC20 and `safeTransferFrom` for NFTs.
- Expect that ERC20 tokens will be approved or refilled into the contract when needed.
- Keep delivery logic simple to minimise gas and surface area for errors.
