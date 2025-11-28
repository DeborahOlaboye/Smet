'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from './ui/button' // You'll need to create this UI component

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()

  const walletConnector = connectors[0]

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </span>
        <Button variant="outline" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => connect({ connector: walletConnector })}
      disabled={!walletConnector.ready || isLoading}
    >
      {isLoading && walletConnector.id === pendingConnector?.id
        ? 'Connecting...'
        : 'Connect Wallet'}
    </Button>
  )
}
