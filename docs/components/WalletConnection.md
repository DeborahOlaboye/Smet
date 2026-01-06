# Wallet Connection

This component adds support for multiple wallet providers via `wagmi` connectors. The UI shows a "Connect Wallet" button which opens a picker listing available connectors (MetaMask, WalletConnect, ...), and allows connecting/disconnecting.

Usage
- `WalletConnectButton` (imported from `@/components/WalletConnectButton`) is used in the app header and shows the current connected address when signed in.

Notes
- Connectors are provided by the configured Wagmi adapter. If you want to explicitly add connectors (e.g., a custom WalletConnect setup), update `src/config/wagmi.ts`.
