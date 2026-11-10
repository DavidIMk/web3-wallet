import { parseEther } from 'viem'
import { describe, expect, it } from 'vitest'
import { validateEthTransfer } from './transfer'

const RECIPIENT = '0x1234567890AbcdEF1234567890aBcdef12345678'

describe('validateEthTransfer', () => {
  it('accepts a valid transfer below the available balance', () => {
    expect(validateEthTransfer(RECIPIENT, '0.1', parseEther('1'))).toBeNull()
  })

  it('rejects invalid recipients and amounts', () => {
    expect(validateEthTransfer('not-an-address', '0.1')).toMatch(/valid Ethereum address/i)
    expect(validateEthTransfer(RECIPIENT, '0')).toMatch(/greater than zero/i)
    expect(validateEthTransfer(RECIPIENT, 'not-eth')).toMatch(/valid ETH amount/i)
  })

  it('requires room for a network fee', () => {
    expect(validateEthTransfer(RECIPIENT, '1', parseEther('1'))).toMatch(/network fee/i)
  })
})
