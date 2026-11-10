import { describe, expect, it } from 'vitest'
import { formatTimestamp, formatTokenAmount, shortenAddress } from './format'

const ADDRESS = '0x1234567890AbcdEF1234567890aBcdef12345678' as const

describe('format helpers', () => {
  it('shortens an Ethereum address without changing its ends', () => {
    expect(shortenAddress(ADDRESS)).toBe('0x12345…45678')
  })

  it('formats ordinary, zero, and tiny token values', () => {
    expect(formatTokenAmount('0')).toBe('0')
    expect(formatTokenAmount('12.34567')).toBe('12.3457')
    expect(formatTokenAmount('0.0000004')).toBe('<0.0001')
  })

  it('handles invalid timestamps safely', () => {
    expect(formatTimestamp('not-a-date')).toBe('Unknown time')
  })
})
