import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  clearStoredTransactions,
  loadTransactions,
  saveTransactions,
} from './transactionStorage'
import type { AppTransaction } from './transactionTypes'

const ADDRESS = '0x1234567890AbcdEF1234567890aBcdef12345678' as Address
const TRANSACTION: AppTransaction = {
  chainId: 11155111,
  from: ADDRESS,
  hash: `0x${'a'.repeat(64)}`,
  status: 'submitted',
  submittedAt: '2026-11-06T08:00:00.000Z',
  to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  valueWei: '1000000000000000',
}

describe('transactionStorage', () => {
  it('round-trips valid transaction activity', () => {
    saveTransactions(11155111, ADDRESS, [TRANSACTION])
    expect(loadTransactions(11155111, ADDRESS)).toEqual([TRANSACTION])
  })

  it('isolates activity by account and chain', () => {
    saveTransactions(11155111, ADDRESS, [TRANSACTION])
    expect(loadTransactions(1, ADDRESS)).toEqual([])
    expect(
      loadTransactions(11155111, '0x0000000000000000000000000000000000000001'),
    ).toEqual([])
  })

  it('clears stored activity', () => {
    saveTransactions(11155111, ADDRESS, [TRANSACTION])
    clearStoredTransactions(11155111, ADDRESS)
    expect(loadTransactions(11155111, ADDRESS)).toEqual([])
  })

  it('ignores malformed storage instead of throwing', () => {
    localStorage.setItem(
      `web3-wallet:activity:v1:11155111:${ADDRESS.toLowerCase()}`,
      '{broken json',
    )
    expect(loadTransactions(11155111, ADDRESS)).toEqual([])
  })
})
