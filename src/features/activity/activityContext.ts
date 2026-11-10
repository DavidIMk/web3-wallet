import { createContext } from 'react'
import type { Hash } from 'viem'
import type { AppTransaction, TransactionStatus } from './transactionTypes'

export interface ActivityContextValue {
  clear: () => void
  record: (transaction: AppTransaction) => void
  transactions: AppTransaction[]
  updateStatus: (
    hash: Hash,
    status: TransactionStatus,
    blockNumber?: string,
  ) => void
}

export const ActivityContext = createContext<ActivityContextValue | null>(null)
