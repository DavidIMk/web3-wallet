import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { sepolia } from 'wagmi/chains'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NetworkGuard } from './NetworkGuard'

const switchChain = vi.hoisted(() => ({
  error: null,
  isPending: false,
  mutate: vi.fn(),
}))

vi.mock('wagmi', () => ({ useSwitchChain: () => switchChain }))

describe('NetworkGuard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('blocks an unsupported chain and requests Sepolia explicitly', async () => {
    const user = userEvent.setup()
    render(<NetworkGuard chainId={1} />)

    expect(screen.getByText(/unsupported network · chain 1/i)).toBeVisible()
    await user.click(screen.getByRole('button', { name: /switch network/i }))

    expect(switchChain.mutate).toHaveBeenCalledWith({ chainId: sepolia.id })
  })
})
