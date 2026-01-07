'use client'

import React from 'react'
import { Connector } from 'wagmi'
import { Button } from './ui/button'

type Props = {
  connectors: Connector[]
  onConnect: (connector: Connector) => void
  isLoading: boolean
  pendingConnector?: Connector | undefined
}

export function ConnectorPicker({ connectors, onConnect, isLoading, pendingConnector }: Props) {
  return (
    <div className="w-64 bg-white dark:bg-slate-900 shadow-md rounded-md p-2">
      {connectors.map((connector) => (
        <div key={connector.id} className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded flex items-center justify-center text-sm font-medium">
              {connector.id === 'injected' ? '🦊' : connector.id === 'walletConnect' ? '🔗' : connector.name?.slice(0, 2)}
            </div>
            <div className="text-sm">
              <div className="font-medium">{connector.name}</div>
              {/* Show whether the connector is ready (e.g., MetaMask injected may be unavailable) */}
              {!connector.ready && <div className="text-xs text-muted-foreground">Unavailable</div>}
            </div>
          </div>
          <div>
            <Button
              onClick={() => onConnect(connector)}
              // Disable the button if the connector isn't ready or a connection is in progress
              disabled={!connector.ready || isLoading}
              className="h-8 px-3 text-sm"
              aria-label={`Connect with ${connector.name}`}
            >
              {/* When a connection is in progress, match the button label to the pending connector */}
              {isLoading && connector.id === pendingConnector?.id ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
