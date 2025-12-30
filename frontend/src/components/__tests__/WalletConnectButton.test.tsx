import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

// Mock wagmi hooks - tests stub out Wagmi's hook implementations to enable
// deterministic UI tests without requiring an active wallet or provider.
const mockUseAccount = vi.fn()
const mockUseConnect = vi.fn()
const mockUseDisconnect = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useConnect: () => mockUseConnect(),
  useDisconnect: () => mockUseDisconnect(),
}))

import { WalletConnectButton } from '../WalletConnectButton'

describe('WalletConnectButton', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('shows connect button and lists connectors', async () => {
    const connectors = [
      { id: 'injected', name: 'MetaMask', ready: true },
      { id: 'walletConnect', name: 'WalletConnect', ready: true },
    ]

    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    const connect = vi.fn()
    mockUseConnect.mockReturnValue({ connectors, connect, isLoading: false, pendingConnector: undefined })
    mockUseDisconnect.mockReturnValue({ disconnect: vi.fn() })

    render(<WalletConnectButton />)

    const button = screen.getByText(/connect wallet/i)
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()

    // open picker
    fireEvent.click(button)

    expect(await screen.findByText('MetaMask')).toBeInTheDocument()
    expect(await screen.findByText('WalletConnect')).toBeInTheDocument()

    const connectButtons = await screen.findAllByText('Connect')
    expect(connectButtons.length).toBeGreaterThanOrEqual(2)

    // click first connector's connect
    fireEvent.click(connectButtons[0])
    expect(connect).toHaveBeenCalled()
  })

  test('shows disabled connect button when no connectors', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    mockUseConnect.mockReturnValue({ connectors: [], connect: vi.fn(), isLoading: false, pendingConnector: undefined })
    mockUseDisconnect.mockReturnValue({ disconnect: vi.fn() })

    render(<WalletConnectButton />)

    const button = screen.getByText(/connect wallet/i)
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('title', 'No wallets available')
  })

  test('shows address and disconnect when connected', () => {
    mockUseAccount.mockReturnValue({ address: '0x1234567890abcdef', isConnected: true })
    mockUseConnect.mockReturnValue({ connectors: [], connect: vi.fn(), isLoading: false, pendingConnector: undefined })
    const disconnect = vi.fn()
    mockUseDisconnect.mockReturnValue({ disconnect })

    render(<WalletConnectButton />)

    expect(screen.getByText(/0x1234/i)).toBeInTheDocument()

    const disconnectButton = screen.getByText(/disconnect/i)
    fireEvent.click(disconnectButton)
    expect(disconnect).toHaveBeenCalled()
  })
})
