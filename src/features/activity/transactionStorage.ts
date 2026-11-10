import { isAddress, isHash, type Address } from 'viem'
import type { AppTransaction, TransactionStatus } from './transactionTypes'

const STORAGE_VERSION = 1
const MAX_TRANSACTIONS = 50

interface StoredActivity {
  transactions: AppTransaction[]
  version: number
}

function storageKey(chainId: number, address: Address) {
  return `web3-wallet:activity:v${STORAGE_VERSION}:${chainId}:${address.toLowerCase()}`
}

function isStatus(value: unknown): value is TransactionStatus {
  return ['submitted', 'confirmed', 'failed', 'unknown'].includes(String(value))
}

function isTransaction(value: unknown): value is AppTransaction {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AppTransaction>

  return (
    typeof candidate.chainId === 'number' &&
    isAddress(candidate.from ?? '') &&
    isHash(candidate.hash ?? '') &&
    isStatus(candidate.status) &&
    typeof candidate.submittedAt === 'string' &&
    isAddress(candidate.to ?? '') &&
    typeof candidate.valueWei === 'string'
  )
}

export function loadTransactions(chainId: number, address: Address): AppTransaction[] {
  try {
    const value = localStorage.getItem(storageKey(chainId, address))
    if (!value) return []

    const parsed = JSON.parse(value) as Partial<StoredActivity>
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.transactions)) return []

    return parsed.transactions.filter(isTransaction).slice(0, MAX_TRANSACTIONS)
  } catch {
    return []
  }
}

export function saveTransactions(
  chainId: number,
  address: Address,
  transactions: AppTransaction[],
) {
  const payload: StoredActivity = {
    version: STORAGE_VERSION,
    transactions: transactions.slice(0, MAX_TRANSACTIONS),
  }

  try {
    localStorage.setItem(storageKey(chainId, address), JSON.stringify(payload))
  } catch {
    // Activity is a convenience cache. Storage failures must not affect a transaction.
  }
}

export function clearStoredTransactions(chainId: number, address: Address) {
  try {
    localStorage.removeItem(storageKey(chainId, address))
  } catch {
    // The UI can still clear its in-memory copy when browser storage is unavailable.
  }
}
