import { useEffect, useState } from 'react'
import { useConnect, useConnectors } from 'wagmi'
import { Icon } from '../../components/Icon'
import { toFriendlyWeb3Error } from '../../web3/errors'

export function ConnectWallet() {
  const connectors = useConnectors()
  const connect = useConnect()
  const connector = connectors[0]
  const [walletAvailable, setWalletAvailable] = useState<boolean | null>(null)
  const error = connect.error ? toFriendlyWeb3Error(connect.error) : null

  useEffect(() => {
    let active = true

    if (!connector) {
      return () => { active = false }
    }

    void connector.getProvider().then((provider) => {
      if (active) setWalletAvailable(Boolean(provider))
    })

    return () => { active = false }
  }, [connector])

  const isWalletAvailable = connector ? walletAvailable : false

  return (
    <div className="connect-panel">
      <div className="connect-illustration" aria-hidden="true">
        <Icon name="wallet" size={32} />
      </div>
      <div>
        <p className="eyebrow">Sepolia testnet</p>
        <h2>Connect your wallet</h2>
        <p className="muted connect-copy">
          Connect MetaMask or another injected wallet to read balances and send test ETH.
        </p>
      </div>
      <button
        className="button button-primary button-wide"
        disabled={!connector || isWalletAvailable !== true || connect.isPending}
        onClick={() => connector && connect.mutate({ connector })}
        type="button"
      >
        <Icon name="plug" />
        {isWalletAvailable === false
          ? 'No browser wallet found'
          : connect.isPending
            ? 'Check your wallet…'
            : 'Connect browser wallet'}
      </button>
      {error ? <p className="notice notice-error" role="alert">{error.message}</p> : null}
      {isWalletAvailable === false ? (
        <p className="notice notice-error" role="status">
          Install or enable MetaMask, then reload this page.
        </p>
      ) : null}
      <a
        className="text-link"
        href="https://metamask.io/download/"
        rel="noreferrer"
        target="_blank"
      >
        Don&apos;t have MetaMask? Install it <Icon name="external" size={14} />
      </a>
    </div>
  )
}
