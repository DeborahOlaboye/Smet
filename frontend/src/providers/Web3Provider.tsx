'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi'

export function Web3Provider({ children }: { children: React.ReactNode }) {
  // Query client for React Query hooks used across the app. It is recreated
  // on each render here for simplicity; consider hoisting if you need global
  // cache persistence across hot reloads or SSR contexts.
  const queryClient = new QueryClient()

  // WagmiProvider provides wallet and provider context for hooks like useAccount.
  // We wrap the app with QueryClientProvider so hooks can access a coherent
  // query cache and background fetching utilities.
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
