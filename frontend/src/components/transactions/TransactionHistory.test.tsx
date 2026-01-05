import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionHistory } from '@/components/transactions/TransactionHistory'

vi.mock('@/services/transactionHistory', () => ({
  transactionHistoryService: {
    getUserTransactions: vi.fn().mockResolvedValue([]),
    getUserTransactionCount: vi.fn().mockResolvedValue(0),
    formatTransactionForDisplay: vi.fn()
  }
}))

describe('TransactionHistory', () => {
  it('shows connect wallet message when not connected', () => {
    render(<TransactionHistory />)
    expect(screen.getByText('Connect your wallet to view transaction history')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<TransactionHistory />)
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument()
  })

  it('shows empty state when no transactions', async () => {
    render(<TransactionHistory />)
    
    await waitFor(() => {
      expect(screen.getByText('No transactions yet')).toBeInTheDocument()
    })
  })

  it('renders refresh button', async () => {
    render(<TransactionHistory />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })
  })
})