import { formatEther } from 'viem'
import { sepolia } from 'wagmi/chains'
import { Icon } from '../../components/Icon'
import { formatTimestamp, formatTokenAmount, shortenAddress } from '../../lib/format'
import { useActivity } from './useActivity'

export function TransactionList() {
  const { clear, transactions } = useActivity()

  return (
    <section className="feature-card activity-card" aria-labelledby="activity-title">
      <header className="feature-header">
        <div className="feature-icon"><Icon name="activity" /></div>
        <div>
          <p className="eyebrow">Saved in this browser</p>
          <h2 id="activity-title">Recent activity</h2>
        </div>
        {transactions.length > 0 ? (
          <button className="button-link" onClick={clear} type="button">Clear</button>
        ) : null}
      </header>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <Icon name="activity" size={27} />
          <p>No transactions sent from this app yet.</p>
          <span>Only app-originated activity is stored here.</span>
        </div>
      ) : (
        <div className="activity-list">
          {transactions.map((transaction) => (
            <a
              className="activity-row"
              href={`${sepolia.blockExplorers.default.url}/tx/${transaction.hash}`}
              key={transaction.hash}
              rel="noreferrer"
              target="_blank"
            >
              <div className="activity-icon"><Icon name="send" size={17} /></div>
              <div className="activity-details">
                <strong>Sent {formatTokenAmount(formatEther(BigInt(transaction.valueWei)), 5)} ETH</strong>
                <span>To {shortenAddress(transaction.to)} · {formatTimestamp(transaction.submittedAt)}</span>
              </div>
              <span className={`status-label status-${transaction.status}`}>{transaction.status}</span>
              <Icon name="external" size={15} />
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
