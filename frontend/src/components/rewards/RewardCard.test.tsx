import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RewardCard } from '@/components/rewards/RewardCard'
import { rewardTypes } from '@/types/reward'

const mockReward = {
  id: '1',
  name: 'Test Reward',
  description: 'A test reward description',
  type: 'rare' as keyof typeof rewardTypes,
  image: '/test-image.jpg',
  probability: 0.25,
  remaining: 50,
  total: 100
}

describe('RewardCard', () => {
  it('renders reward information correctly', () => {
    render(<RewardCard reward={mockReward} />)
    
    expect(screen.getByText('Test Reward')).toBeInTheDocument()
    expect(screen.getByText('A test reward description')).toBeInTheDocument()
    expect(screen.getByText('25.0%')).toBeInTheDocument()
    expect(screen.getByText('50/100 left')).toBeInTheDocument()
  })

  it('calls onOpen when button is clicked', async () => {
    const handleOpen = vi.fn()
    const user = userEvent.setup()
    
    render(<RewardCard reward={mockReward} onOpen={handleOpen} />)
    
    const button = screen.getByRole('button', { name: /open reward/i })
    await user.click(button)
    
    expect(handleOpen).toHaveBeenCalledWith('1')
  })

  it('shows loading state when isLoading is true', () => {
    render(<RewardCard reward={mockReward} isLoading={true} />)
    
    expect(screen.getByText('Opening...')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('disables button when no rewards remaining', () => {
    const noRemainingReward = { ...mockReward, remaining: 0 }
    render(<RewardCard reward={noRemainingReward} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('bg-gray-400')
  })

  it('displays correct progress bar width', () => {
    render(<RewardCard reward={mockReward} />)
    
    const progressBar = document.querySelector('.bg-blue-600')
    expect(progressBar).toHaveStyle({ width: '50%' })
  })
})
