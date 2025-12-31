import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID

if (!projectId) {
  // Fail fast during server startup/config if the project id is missing; the
  // app relies on it to initialise WalletConnect/connector services.
  throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not defined in .env.local')
}

// Supported network list - the app currently targets Mainnet and Sepolia for
// convenience during development and testing. Add or remove networks as
// deployment requirements evolve.
export const networks = [mainnet, sepolia]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

// Export the wagmi configuration that the provider consumes
export const config = wagmiAdapter.wagmiConfig
