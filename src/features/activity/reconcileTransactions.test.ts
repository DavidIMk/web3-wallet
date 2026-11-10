import type { Address, Hash } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { reconcilePendingTransactions } from './reconcileTransactions'
import type { AppTransaction } from './transactionTypes'

const HASH = `0x${'a'.repeat(64)}` as Hash
const BASE_TRANSACTION: AppTransaction = {
  chainId: 11155111,
  from: '0x1234567890AbcdEF1234567890aBcdef12345678' as Address,
  hash: HASH,
  status: 'submitted',
  submittedAt: '2026-11-08T03:00:00.000Z',
  to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  valueWei: '1000000000000000',
}

describe('reconcilePendingTransactions', () => {
  it('marks a successful receipt as confirmed', async () => {
    const transactions = [BASE_TRANSACTION]
    const result = await reconcilePendingTransactions(
      transactions,
      vi.fn().mockResolvedValue({ blockNumber: 42n, status: 'success' }),
    )

    expect(result).toEqual([{ ...BASE_TRANSACTION, blockNumber: '42', status: 'confirmed' }])
  })

  it('marks a reverted receipt as failed', async () => {
    const result = await reconcilePendingTransactions(
      [{ ...BASE_TRANSACTION, status: 'unknown' }],
      vi.fn().mockResolvedValue({ blockNumber: 43n, status: 'reverted' }),
    )

    expect(result[0]).toMatchObject({ blockNumber: '43', status: 'failed' })
  })

  it('preserves pending state when the RPC cannot return a receipt', async () => {
    const transactions = [BASE_TRANSACTION]
    const result = await reconcilePendingTransactions(
      transactions,
      vi.fn().mockRejectedValue(new Error('RPC unavailable')),
    )

    expect(result).toBe(transactions)
    expect(result[0]).toEqual(BASE_TRANSACTION)
  })

  it('does not query finalized transactions', async () => {
    const lookup = vi.fn()
    const transactions = [{ ...BASE_TRANSACTION, status: 'confirmed' as const }]

    expect(await reconcilePendingTransactions(transactions, lookup)).toBe(transactions)
    expect(lookup).not.toHaveBeenCalled()
  })
})
