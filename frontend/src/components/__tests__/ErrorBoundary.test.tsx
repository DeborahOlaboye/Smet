import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

function Bomb() {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  test('renders fallback on child error and resets', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <div>ok</div>
      </ErrorBoundary>
    )

    expect(screen.queryByText(/ok/i)).toBeInTheDocument()

    // render the bomb to trigger an error
    rerender(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/try again/i)).toBeInTheDocument()

    // click try again to reset
    fireEvent.click(screen.getByText(/try again/i))

    // After reset, children are not rendered (we'd need to re-render with safe children)
    rerender(
      <ErrorBoundary>
        <div>ok again</div>
      </ErrorBoundary>
    )

    expect(screen.getByText(/ok again/i)).toBeInTheDocument()
  })
})
