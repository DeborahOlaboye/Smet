import React from 'react'
import { render, screen } from '@testing-library/react'
import { ConnectorPicker } from '../ConnectorPicker'

describe('ConnectorPicker', () => {
  test('renders connectors and buttons have aria-labels', () => {
    const connectors = [
      { id: 'injected', name: 'MetaMask', ready: true },
      { id: 'walletConnect', name: 'WalletConnect', ready: false },
    ] as any

    const onConnect = jest.fn()

    render(<ConnectorPicker connectors={connectors} onConnect={onConnect} isLoading={false} />)

    expect(screen.getByText('MetaMask')).toBeInTheDocument()
    expect(screen.getByText('WalletConnect')).toBeInTheDocument()

    expect(screen.getByLabelText('Connect with MetaMask')).toBeInTheDocument()
    expect(screen.getByLabelText('Connect with WalletConnect')).toBeInTheDocument()
  })
})
