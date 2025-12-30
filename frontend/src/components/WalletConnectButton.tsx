'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from './ui/button'
import { ConnectorPicker } from './ConnectorPicker'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Attempt to connect with the selected connector. We close the picker
  // after starting the connection flow; the connect() call may prompt the
  // wallet UI and is responsible for updating the `useAccount` state.
  async function handleConnect(connector: any) {
    await connect({ connector })
    setOpen(false)
  }

  useEffect(() => {
    // Close the connector picker when clicking outside or pressing Escape.
    // This is attached only while the picker is open for minimal event work.
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    if (open) {
      document.addEventListener('click', onDocClick)
      document.addEventListener('keydown', onKey)
    }

    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

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

  const hasConnectors = connectors && connectors.length > 0

  return (
    <div className="relative" ref={containerRef}>
      <Button onClick={() => setOpen((v) => !v)} disabled={!hasConnectors} title={!hasConnectors ? 'No wallets available' : undefined}>
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
