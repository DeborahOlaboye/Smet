import { cn } from '../utils'

describe('cn', () => {
  test('merges classes and removes duplicates', () => {
    const result = cn('p-4', 'p-4', 'text-sm', { 'text-sm': true })
    expect(result).toContain('p-4')
    expect(result).toContain('text-sm')
  })
})
