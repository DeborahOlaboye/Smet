import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}))

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: false,
    isConnecting: false,
    isDisconnected: true
  }),
  useConnect: () => ({
    connect: vi.fn(),
    connectors: [{ id: 'mock', name: 'Mock Connector' }],
    isLoading: false,
    error: null
  }),
  useDisconnect: () => ({
    disconnect: vi.fn()
  })
}))

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    formatEther: (value: string) => '1.0',
    parseEther: (value: string) => BigInt('1000000000000000000'),
    Contract: vi.fn(),
    BrowserProvider: vi.fn()
  }
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})