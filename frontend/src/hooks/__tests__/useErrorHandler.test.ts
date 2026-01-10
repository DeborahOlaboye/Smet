import { describe, test, expect, vi } from 'vitest'
import { useErrorHandler } from '../useErrorHandler'

// Mock the toast module to capture calls
const mockToast = vi.fn()
vi.mock('@/components/ui/use-toast', () => ({ useToast: () => mockToast }))

// Helper component to call the hook functions
import { renderHook, act } from '@testing-library/react'

describe('useErrorHandler', () => {
  test('handleError normalizes Error and calls toast', () => {
    const { result } = renderHook(() => useErrorHandler())
    const msg = result.current.handleError(new Error('boom'))
    expect(mockToast).toHaveBeenCalled()
    expect(msg).toBe('boom')
  })

  test('handleError handles unknown value and returns default message', () => {
    const { result } = renderHook(() => useErrorHandler())
    const msg = result.current.handleError(123 as any, 'default')
    expect(mockToast).toHaveBeenCalled()
    expect(msg).toBe('default')
  })

  test('handleSuccess calls toast', () => {
    const { result } = renderHook(() => useErrorHandler())
    result.current.handleSuccess('yay')
    expect(mockToast).toHaveBeenCalled()
  })

  test('handleLoading shows a loading toast when true', () => {
    const { result } = renderHook(() => useErrorHandler())
    result.current.handleLoading(true, 'working')
    expect(mockToast).toHaveBeenCalled()
  })
})
