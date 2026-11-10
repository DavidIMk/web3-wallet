import { useMemo } from 'react'
import { erc20Abi, formatUnits, type Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Icon } from '../../components/Icon'
import { formatTokenAmount, shortenAddress } from '../../lib/format'
import { trackedTokens } from './tokenConfig'

interface TokenBalancesProps {
  address: Address
}

export function TokenBalances({ address }: TokenBalancesProps) {
  const contracts = useMemo(
    () =>
      trackedTokens.flatMap((token) => [
        {
          abi: erc20Abi,
          address: token.address,
          args: [address] as const,
          chainId: sepolia.id,
          functionName: 'balanceOf' as const,
        },
        {
          abi: erc20Abi,
          address: token.address,
          chainId: sepolia.id,
          functionName: 'symbol' as const,
        },
        {
          abi: erc20Abi,
          address: token.address,
          chainId: sepolia.id,
          functionName: 'decimals' as const,
        },
      ]),
    [address],
  )

  const reads = useReadContracts({
    allowFailure: true,
    contracts,
    query: { enabled: trackedTokens.length > 0 },
  })

  return (
    <section className="feature-card" aria-labelledby="token-balances-title">
      <header className="feature-header">
        <div className="feature-icon"><Icon name="token" /></div>
        <div>
          <p className="eyebrow">ERC-20 contracts</p>
          <h2 id="token-balances-title">Token balances</h2>
        </div>
        <button
          aria-label="Refresh token balances"
          className="icon-button"
          disabled={reads.isFetching}
          onClick={() => void reads.refetch()}
          type="button"
        >
          <Icon name="refresh" size={17} />
        </button>
      </header>

      <div className="token-list">
        {trackedTokens.map((token, tokenIndex) => {
          const offset = tokenIndex * 3
          const balanceResult = reads.data?.[offset]
          const symbolResult = reads.data?.[offset + 1]
          const decimalsResult = reads.data?.[offset + 2]
          const balance = balanceResult?.status === 'success' ? balanceResult.result : undefined
          const symbol = symbolResult?.status === 'success'
            ? String(symbolResult.result)
            : token.expectedSymbol
          const decimals = decimalsResult?.status === 'success'
            ? Number(decimalsResult.result)
            : token.expectedDecimals
          const formatted = typeof balance === 'bigint'
            ? formatTokenAmount(formatUnits(balance, decimals), 5)
            : null

          return (
            <div className="token-row" key={token.address}>
              <div className="token-mark">{symbol.slice(0, 1)}</div>
              <div className="token-details">
                <strong>{symbol}</strong>
                <span>{token.description} · {shortenAddress(token.address)}</span>
              </div>
              <div className="token-value">
                <strong>{reads.isPending ? '—' : formatted ?? 'Unavailable'}</strong>
                <div className="token-links">
                  <a
                    href={`${sepolia.blockExplorers.default.url}/token/${token.address}`}
                    rel="noreferrer"
                    target="_blank"
                  >Contract</a>
                  {token.faucetUrl ? <a href={token.faucetUrl} rel="noreferrer" target="_blank">Faucet</a> : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {reads.error ? (
        <p className="notice notice-error" role="alert">
          One or more token calls failed. Try refreshing or check the RPC endpoint.
        </p>
      ) : null}
    </section>
  )
}
