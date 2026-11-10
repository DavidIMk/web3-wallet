import type { Address, Hash } from 'viem'

export type TransactionStatus = 'submitted' | 'confirmed' | 'failed' | 'unknown'

export interface AppTransaction {
  blockNumber?: string
  chainId: number
  from: Address
  hash: Hash
  status: TransactionStatus
  submittedAt: string
  to: Address
  valueWei: string
}
