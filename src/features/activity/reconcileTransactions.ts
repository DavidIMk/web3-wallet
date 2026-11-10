import type { Hash } from 'viem'
import type { AppTransaction } from './transactionTypes'

interface TransactionReceiptSummary {
  blockNumber: bigint
  status: 'reverted' | 'success'
}

export type ReceiptLookup = (hash: Hash) => Promise<TransactionReceiptSummary>

export async function reconcilePendingTransactions(
  transactions: AppTransaction[],
  getReceipt: ReceiptLookup,
): Promise<AppTransaction[]> {
  let changed = false

  const next = await Promise.all(
    transactions.map(async (transaction) => {
      if (transaction.status !== 'submitted' && transaction.status !== 'unknown') {
        return transaction
      }

      try {
        const receipt = await getReceipt(transaction.hash)
        changed = true

        return {
          ...transaction,
          blockNumber: receipt.blockNumber.toString(),
          status: receipt.status === 'success' ? 'confirmed' : 'failed',
        } satisfies AppTransaction
      } catch {
        // A missing receipt or temporary RPC failure does not prove failure.
        return transaction
      }
    }),
  )

  return changed ? next : transactions
}
