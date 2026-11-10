import { useCallback } from 'react'
import { formatEther } from 'viem'
import { useBalance, useConnection } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { ActivityProvider } from '../activity/ActivityProvider'
import { TransactionList } from '../activity/TransactionList'
import { SendEthForm } from '../send/SendEthForm'
import { TokenBalances } from '../tokens/TokenBalances'
import { ConnectWallet } from './ConnectWallet'
import { NetworkGuard } from './NetworkGuard'
import { WalletOverview } from './WalletOverview'

export function WalletDashboard() {
  const connection = useConnection()
  const isSepolia = connection.chainId === sepolia.id
  const balance = useBalance({
    address: connection.address,
    chainId: sepolia.id,
    query: { enabled: connection.status === 'connected' && isSepolia },
  })
  const refetchBalance = balance.refetch
  const refreshBalance = useCallback(() => {
    void refetchBalance()
  }, [refetchBalance])

  if (connection.status === 'connecting' || connection.status === 'reconnecting') {
    return (
      <div className="connect-panel" aria-live="polite">
        <div className="loading-ring" />
        <h2>{connection.status === 'reconnecting' ? 'Restoring wallet session' : 'Connecting wallet'}</h2>
        <p className="muted">Waiting for your browser wallet…</p>
      </div>
    )
  }

  if (connection.status !== 'connected') return <ConnectWallet />

  if (!isSepolia) return <NetworkGuard chainId={connection.chainId} />

  return (
    <ActivityProvider
      address={connection.address}
      chainId={connection.chainId}
      key={`${connection.chainId}:${connection.address}`}
    >
      <WalletOverview
        address={connection.address}
        balance={balance.data ? formatEther(balance.data.value) : undefined}
        balanceError={balance.isError}
        isBalanceFetching={balance.isFetching}
        onRefresh={refreshBalance}
      />
      <div className="feature-grid">
        <SendEthForm
          address={connection.address}
          balanceWei={balance.data?.value}
          onConfirmed={refreshBalance}
        />
        <TokenBalances address={connection.address} />
      </div>
      <TransactionList />
    </ActivityProvider>
  )
}
