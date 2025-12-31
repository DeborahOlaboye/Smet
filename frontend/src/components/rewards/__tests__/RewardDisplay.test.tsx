import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { RewardDisplay } from '../RewardDisplay'

const mockUseError = vi.fn().mockReturnValue({ handleError: vi.fn(), handleSuccess: vi.fn(), handleLoading: vi.fn() })
vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => mockUseError(),
}))

const baseReward: any = {
  id: 'r1',
  type: 'gold',
  name: 'Gold Coin',
  description: 'Nice',
  probability: 0.1,
  remaining: 1,
  total: 10,
  isClaimed: false,
  image: '/img.png'
}

describe('RewardDisplay', () => {
  test('claims successfully and shows claimed state', async () => {
    const onClaim = vi.fn().mockResolvedValue({ success: true, transactionHash: '0xabc' })
    render(<RewardDisplay reward={{ ...baseReward }} onClaim={onClaim} />)

    const claimButton = screen.getByText(/claim reward/i)
    fireEvent.click(claimButton)

    await waitFor(() => expect(onClaim).toHaveBeenCalled())
    expect(await screen.findByText(/claimed/i)).toBeInTheDocument()
  })

  test('handles claim error and calls handleError', async () => {
    const onClaim = vi.fn().mockRejectedValue(new Error('fail'))
    const mockHandlers = { handleError: vi.fn(), handleSuccess: vi.fn(), handleLoading: vi.fn() }
    mockUseError.mockReturnValue(mockHandlers)

    render(<RewardDisplay reward={{ ...baseReward }} onClaim={onClaim} />)

    const claimButton = screen.getByText(/claim reward/i)
    fireEvent.click(claimButton)

    await waitFor(() => expect(onClaim).toHaveBeenCalled())
    await waitFor(() => expect(mockHandlers.handleError).toHaveBeenCalled())
  })

  test('shows locked badge when reward availableAfter is in future', () => {
    const onClaim = vi.fn()
    const future = Math.floor(Date.now()/1000) + 3600
    render(<RewardDisplay reward={{ ...baseReward, availableAfter: future }} onClaim={onClaim} />)

    expect(screen.getByText(/locked/i)).toBeInTheDocument()
  })
})