import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import type { Address, Hash } from 'viem'
import { usePublicClient } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { ActivityContext } from './activityContext'
import { reconcilePendingTransactions } from './reconcileTransactions'
import {
  clearStoredTransactions,
  loadTransactions,
  saveTransactions,
} from './transactionStorage'
import type { AppTransaction, TransactionStatus } from './transactionTypes'

interface ActivityProviderProps extends PropsWithChildren {
  address: Address
  chainId: number
}

export function ActivityProvider({
  address,
  chainId,
  children,
}: ActivityProviderProps) {
  const publicClient = usePublicClient({ chainId: sepolia.id })
  const [transactions, setTransactions] = useState(() =>
    loadTransactions(chainId, address),
  )
  const transactionsRef = useRef(transactions)

  useEffect(() => {
    transactionsRef.current = transactions
  }, [transactions])

  useEffect(() => {
    if (!publicClient) return

    let active = true
    let reconciliationRunning = false

    async function reconcile() {
      if (reconciliationRunning || !publicClient) return
      reconciliationRunning = true
      const snapshot = transactionsRef.current

      const next = await reconcilePendingTransactions(snapshot, (hash) =>
        publicClient.getTransactionReceipt({ hash }),
      )

      if (active && transactionsRef.current === snapshot && next !== snapshot) {
        transactionsRef.current = next
        saveTransactions(chainId, address, next)
        setTransactions(next)
      }

      reconciliationRunning = false
    }

    void reconcile()
    const interval = window.setInterval(() => void reconcile(), 15_000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [address, chainId, publicClient])

  const record = useCallback(
    (transaction: AppTransaction) => {
      setTransactions((current) => {
        const withoutDuplicate = current.filter((item) => item.hash !== transaction.hash)
        const next = [transaction, ...withoutDuplicate]
        transactionsRef.current = next
        saveTransactions(chainId, address, next)
        return next
      })
    },
    [address, chainId],
  )

  const updateStatus = useCallback(
    (hash: Hash, status: TransactionStatus, blockNumber?: string) => {
      setTransactions((current) => {
        const next = current.map((transaction) =>
          transaction.hash === hash
            ? { ...transaction, blockNumber, status }
            : transaction,
        )
        transactionsRef.current = next
        saveTransactions(chainId, address, next)
        return next
      })
    },
    [address, chainId],
  )

  const clear = useCallback(() => {
    clearStoredTransactions(chainId, address)
    transactionsRef.current = []
    setTransactions([])
  }, [address, chainId])

  const value = useMemo(
    () => ({ clear, record, transactions, updateStatus }),
    [clear, record, transactions, updateStatus],
  )

  return <ActivityContext value={value}>{children}</ActivityContext>
}
