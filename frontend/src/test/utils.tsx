import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Mock Web3Provider for testing
const MockWeb3Provider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="mock-web3-provider">{children}</div>
}

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: MockWeb3Provider,
    ...options,
  })
}

// Test data factories
export const createMockReward = (overrides = {}) => ({
  id: '1',
  name: 'Test Reward',
  description: 'A test reward',
  type: 'rare' as const,
  image: '/test-image.jpg',
  probability: 0.25,
  remaining: 50,
  total: 100,
  ...overrides
})

export const createMockTransaction = (overrides = {}) => ({
  id: '1',
  user: '0x123',
  contractAddress: '0x456',
  contractName: 'SmetGold',
  action: 'TRANSFER',
  amount: '100',
  tokenId: '0',
  txHash: '0x789',
  timestamp: 1640995200,
  blockNumber: 12345,
  status: 'confirmed' as const,
  ...overrides
})

// Utility functions
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    })
  }
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }