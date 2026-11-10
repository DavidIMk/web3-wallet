import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { AppProviders } from './app/AppProviders'

describe('App', () => {
  it('renders the disconnected wallet experience', async () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(screen.getByRole('heading', { name: /your testnet wallet/i })).toBeVisible()
    expect(await screen.findByRole('button', { name: /no browser wallet found/i })).toBeDisabled()
    expect(screen.getByText(/install or enable MetaMask/i)).toBeVisible()
    expect(screen.getByText(/testnet only/i)).toBeVisible()
  })
})
