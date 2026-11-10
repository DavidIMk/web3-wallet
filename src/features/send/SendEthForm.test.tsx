import { render, screen, waitFor } from '@testing-library/react'
import type { Address, Hash } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SendEthForm } from './SendEthForm'

const mocks = vi.hoisted(() => ({
  onConfirmed: vi.fn(),
  record: vi.fn(),
  reset: vi.fn(),
  sendState: {
    data: `0x${'a'.repeat(64)}`,
    error: null,
    isPending: false,
    mutate: vi.fn(),
  },
  receiptState: {
    data: undefined as { blockNumber: bigint; status: 'reverted' | 'success' } | undefined,
    error: null as Error | null,
    isError: false,
    isPending: false,
    isSuccess: false,
  },
  updateStatus: vi.fn(),
}))

vi.mock('wagmi', () => ({
  useSendTransaction: () => ({ ...mocks.sendState, reset: mocks.reset }),
  useWaitForTransactionReceipt: () => mocks.receiptState,
}))

vi.mock('../activity/useActivity', () => ({
  useActivity: () => ({
    record: mocks.record,
    updateStatus: mocks.updateStatus,
  }),
}))

const ADDRESS = '0x1234567890AbcdEF1234567890aBcdef12345678' as Address
const HASH = mocks.sendState.data as Hash

describe('SendEthForm receipt handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(mocks.receiptState, {
      data: undefined,
      error: null,
      isError: false,
      isPending: false,
      isSuccess: false,
    })
  })

  it('confirms a transaction only when the receipt status is successful', async () => {
    Object.assign(mocks.receiptState, {
      data: { blockNumber: 42n, status: 'success' },
      isSuccess: true,
    })

    render(<SendEthForm address={ADDRESS} balanceWei={2n} onConfirmed={mocks.onConfirmed} />)

    expect(await screen.findByText('Transaction confirmed')).toBeVisible()
    await waitFor(() => expect(mocks.updateStatus).toHaveBeenCalledWith(HASH, 'confirmed', '42'))
    expect(mocks.onConfirmed).toHaveBeenCalledOnce()
  })

  it('marks an included but reverted transaction as failed', async () => {
    Object.assign(mocks.receiptState, {
      data: { blockNumber: 43n, status: 'reverted' },
      isSuccess: true,
    })

    render(<SendEthForm address={ADDRESS} balanceWei={2n} onConfirmed={mocks.onConfirmed} />)

    expect(await screen.findByText('Transaction reverted')).toBeVisible()
    await waitFor(() => expect(mocks.updateStatus).toHaveBeenCalledWith(HASH, 'failed', '43'))
    expect(mocks.onConfirmed).not.toHaveBeenCalled()
  })

  it('uses unknown instead of failed when receipt lookup has an RPC error', async () => {
    Object.assign(mocks.receiptState, {
      error: new Error('network request failed'),
      isError: true,
    })

    render(<SendEthForm address={ADDRESS} balanceWei={2n} onConfirmed={mocks.onConfirmed} />)

    expect(await screen.findByText('Confirmation unavailable')).toBeVisible()
    await waitFor(() => expect(mocks.updateStatus).toHaveBeenCalledWith(HASH, 'unknown'))
    expect(mocks.onConfirmed).not.toHaveBeenCalled()
  })
})
