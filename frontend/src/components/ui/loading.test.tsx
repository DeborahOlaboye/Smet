import { render, screen } from '@testing-library/react'
import { LoadingSpinner, LoadingOverlay, LoadingCard } from '@/components/ui/loading'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('displays text when provided', () => {
    render(<LoadingSpinner text="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(document.querySelector('.h-4')).toBeInTheDocument()
    
    rerender(<LoadingSpinner size="lg" />)
    expect(document.querySelector('.h-8')).toBeInTheDocument()
  })
})

describe('LoadingOverlay', () => {
  it('renders when visible', () => {
    render(<LoadingOverlay isVisible={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(<LoadingOverlay isVisible={false} />)
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('displays custom text', () => {
    render(<LoadingOverlay isVisible={true} text="Processing..." />)
    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })
})

describe('LoadingCard', () => {
  it('renders skeleton elements', () => {
    render(<LoadingCard />)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(document.querySelector('.bg-gray-200')).toBeInTheDocument()
  })
})