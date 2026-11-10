import { Icon } from './components/Icon'
import { WalletDashboard } from './features/wallet/WalletDashboard'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Web3 Wallet Lab home">
          <span className="brand-mark"><Icon name="wallet" size={21} /></span>
          <span>Wallet<span>Lab</span></span>
        </a>
        <span className="header-link">Learning &amp; hobby project</span>
      </header>

      <main>
        <section className="hero-copy">
          <span className="hero-kicker"><span className="status-dot" /> Built on Ethereum Sepolia</span>
          <h1>Your testnet wallet,<br /><span>made understandable.</span></h1>
          <p>
            Connect a browser wallet, inspect real onchain balances, and follow every
            test transaction from signature to confirmation.
          </p>
        </section>

        <div className="dashboard-frame">
          <div className="dashboard-heading">
            <div>
              <p className="eyebrow">Portfolio demo</p>
              <h2>Web3 Wallet Dashboard</h2>
            </div>
            <span className="testnet-badge">TESTNET ONLY</span>
          </div>
          <WalletDashboard />
        </div>
      </main>

      <footer>
        <p>Built as a learning and hobby project with React, wagmi, viem, and a healthy respect for private keys.</p>
        <p>Never send real assets to testnet addresses.</p>
      </footer>
    </div>
  )
}

export default App
