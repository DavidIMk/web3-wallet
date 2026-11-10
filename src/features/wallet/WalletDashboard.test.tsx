import { render, screen } from '@testing-library/react'
import type { Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WalletDashboard } from './WalletDashboard'

const mocks = vi.hoisted(() => ({
  balance: {
    data: undefined as { value: bigint } | undefined,
    error: null as Error | null,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  },
  connection: {
    address: undefined as Address | undefined,
    chainId: undefined as number | undefined,
    status: 'disconnected',
  },
  disconnect: { isPending: false, mutate: vi.fn() },
}))

vi.mock('wagmi', () => ({
  useBalance: () => mocks.balance,
  useConnection: () => mocks.connection,
  useDisconnect: () => mocks.disconnect,
}))

vi.mock('../activity/ActivityProvider', () => ({
  ActivityProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../activity/TransactionList', () => ({
  TransactionList: () => <div>Activity panel</div>,
}))

vi.mock('../send/SendEthForm', () => ({
  SendEthForm: () => <div>Send panel</div>,
}))

vi.mock('../tokens/TokenBalances', () => ({
  TokenBalances: () => <div>Token panel</div>,
}))

vi.mock('./ConnectWallet', () => ({
  ConnectWallet: () => <div>Connect panel</div>,
}))

vi.mock('./NetworkGuard', () => ({
  NetworkGuard: ({ chainId }: { chainId: number }) => <div>Wrong network {chainId}</div>,
}))

const ADDRESS_A = '0x1234567890AbcdEF1234567890aBcdef12345678' as Address
const ADDRESS_B = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address

describe('WalletDashboard', () => {
  beforeEach(() => {
    Object.assign(mocks.connection, {
      address: undefined,
      chainId: undefined,
      status: 'disconnected',
    })
    Object.assign(mocks.balance, {
      data: undefined,
      error: null,
      isError: false,
      isFetching: false,
    })
    vi.clearAllMocks()
  })

  it('shows the connection entry point while disconnected', () => {
    render(<WalletDashboard />)
    expect(screen.getByText('Connect panel')).toBeVisible()
  })

  it('blocks wallet features on the wrong chain', () => {
    Object.assign(mocks.connection, {
      address: ADDRESS_A,
      chainId: 1,
      status: 'connected',
    })

    render(<WalletDashboard />)
    expect(screen.getByText('Wrong network 1')).toBeVisible()
    expect(screen.queryByText('Send panel')).not.toBeInTheDocument()
  })

  it('shows the connected Sepolia balance and feature panels', () => {
    Object.assign(mocks.connection, {
      address: ADDRESS_A,
      chainId: 11155111,
      status: 'connected',
    })
    mocks.balance.data = { value: 1_000_000_000_000_000_000n }

    render(<WalletDashboard />)

    expect(document.getElementById('wallet-overview-title')).toHaveTextContent('1 ETH')
    expect(screen.getByText('Send panel')).toBeVisible()
    expect(screen.getByText('Token panel')).toBeVisible()
    expect(screen.getByText('Activity panel')).toBeVisible()
  })

  it('responds to account changes and balance RPC failures', () => {
    Object.assign(mocks.connection, {
      address: ADDRESS_A,
      chainId: 11155111,
      status: 'connected',
    })
    mocks.balance.data = { value: 1n }
    const view = render(<WalletDashboard />)
    expect(screen.getByText('0x123456…345678')).toBeVisible()

    mocks.connection.address = ADDRESS_B
    mocks.balance.data = undefined
    mocks.balance.error = new Error('RPC unavailable')
    mocks.balance.isError = true
    view.rerender(<WalletDashboard />)

    expect(screen.getByText('0xabcdef…efabcd')).toBeVisible()
    expect(screen.getByText('Unavailable')).toBeVisible()
    expect(screen.getByText(/RPC endpoint could not load/i)).toBeVisible()
  })
})
