import { useState } from 'react'
import type { Address } from 'viem'
import { useDisconnect } from 'wagmi'
import { Icon } from '../../components/Icon'
import { formatTokenAmount, shortenAddress } from '../../lib/format'

interface WalletOverviewProps {
  address: Address
  balance?: string
  balanceError: boolean
  isBalanceFetching: boolean
  onRefresh: () => void
}

export function WalletOverview({
  address,
  balance,
  balanceError,
  isBalanceFetching,
  onRefresh,
}: WalletOverviewProps) {
  const disconnect = useDisconnect()
  const [copied, setCopied] = useState(false)

  async function copyAddress() {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1_500)
  }

  return (
    <section className="wallet-overview" aria-labelledby="wallet-overview-title">
      <div className="overview-topline">
        <div>
          <p className="eyebrow">Connected wallet</p>
          <button className="address-button" onClick={copyAddress} type="button">
            <span>{shortenAddress(address, 6)}</span>
            <Icon name={copied ? 'check' : 'copy'} size={17} />
            <span className="sr-only">{copied ? 'Address copied' : 'Copy wallet address'}</span>
          </button>
        </div>
        <span className="network-pill"><span className="status-dot" /> Sepolia</span>
      </div>

      <div className="balance-block">
        <p className="balance" id="wallet-overview-title">
          {balanceError ? 'Unavailable' : balance === undefined ? '—' : formatTokenAmount(balance, 5)}
          {balanceError || balance === undefined ? null : <span> ETH</span>}
        </p>
        <p className="muted">
          {balanceError
            ? 'The RPC endpoint could not load this balance.'
            : isBalanceFetching
              ? 'Refreshing Sepolia balance…'
              : 'Live Sepolia testnet balance'}
        </p>
      </div>

      <div className="overview-actions">
        <button className="button button-secondary" onClick={onRefresh} type="button">
          <Icon name="refresh" size={17} /> Refresh
        </button>
        <button
          className="button button-ghost"
          disabled={disconnect.isPending}
          onClick={() => disconnect.mutate()}
          type="button"
        >
          Disconnect
        </button>
      </div>
    </section>
  )
}
