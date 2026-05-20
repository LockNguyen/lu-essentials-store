import { describe, it, expect } from 'vitest'

import { formatPrice } from '@/helpers/priceFormatter'

describe('formatPrice', () => {
  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('formats a whole number with two decimal places', () => {
    expect(formatPrice(10)).toBe('$10.00')
  })

  it('formats a large price with comma thousands separator', () => {
    expect(formatPrice(1299.99)).toBe('$1,299.99')
  })
})
