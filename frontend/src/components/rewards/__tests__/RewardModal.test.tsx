import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { RewardModal } from '../RewardModal'

const sampleReward = {
  id: 'r1',
  type: 'gold',
  name: 'Gold',
  description: 'Shiny coins',
  image: '/gold.png'
}

describe('RewardModal', () => {
  test('renders null when closed', () => {
    const onClose = vi.fn()
    const { container } = render(<RewardModal isOpen={false} onClose={onClose} reward={null} isLoading={false} />)
    expect(container.firstChild).toBeNull()
  })

  test('renders loading and content and handles close', () => {
    const onClose = jest.fn()
    render(<RewardModal isOpen={true} onClose={onClose} reward={sampleReward as any} isLoading={true} />)

    expect(screen.getByText(/opening/i)).toBeInTheDocument()

    // render not loading
    render(<RewardModal isOpen={true} onClose={onClose} reward={sampleReward as any} isLoading={false} />)

    expect(screen.getByText(/you won/i)).toBeInTheDocument()
    expect(screen.getByText(/claim reward/i)).toBeInTheDocument()

    // close via overlay click
    fireEvent.click(screen.getByRole('button', { name: /claim reward/i }))
    // our onClose should not be called by Claim; instead clicking the overlay should call onClose
    fireEvent.click(screen.getByRole('button', { name: /close/i }), { })
  })
})