import { sepolia } from 'wagmi/chains'
import { useSwitchChain } from 'wagmi'
import { Icon } from '../../components/Icon'
import { toFriendlyWeb3Error } from '../../web3/errors'

interface NetworkGuardProps {
  chainId: number
}

export function NetworkGuard({ chainId }: NetworkGuardProps) {
  const switchChain = useSwitchChain()
  const error = switchChain.error ? toFriendlyWeb3Error(switchChain.error) : null

  return (
    <section className="network-guard" aria-labelledby="wrong-network-title">
      <span className="status-dot status-dot-warning" />
      <div>
        <p className="eyebrow">Unsupported network · Chain {chainId}</p>
        <h2 id="wrong-network-title">Switch to Ethereum Sepolia</h2>
        <p className="muted">
          This learning project intentionally blocks transactions on every other network.
        </p>
        {error ? <p className="notice notice-error" role="alert">{error.message}</p> : null}
      </div>
      <button
        className="button button-primary"
        disabled={switchChain.isPending}
        onClick={() => switchChain.mutate({ chainId: sepolia.id })}
        type="button"
      >
        {switchChain.isPending ? 'Switching…' : 'Switch network'}
        <Icon name="arrow" />
      </button>
    </section>
  )
}
