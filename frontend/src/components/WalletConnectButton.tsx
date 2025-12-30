'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from './ui/button'
import { ConnectorPicker } from './ConnectorPicker'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const [open, setOpen] = useState(false)

  async function handleConnect(connector: any) {
    await connect({ connector })
    setOpen(false)
  }

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
    <div className="relative">
      <Button onClick={() => setOpen((v) => !v)}>
        Connect Wallet
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 z-50">
          <ConnectorPicker
            connectors={connectors}
            onConnect={handleConnect}
            isLoading={isLoading}
            pendingConnector={pendingConnector}
          />
        </div>
      )}
    </div>
  )
}
