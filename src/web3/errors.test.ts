import { describe, expect, it } from 'vitest'
import { toFriendlyWeb3Error } from './errors'

describe('toFriendlyWeb3Error', () => {
  it('finds a wallet rejection in a nested cause', () => {
    const error = new Error('Transaction failed', {
      cause: { code: 4001, message: 'User rejected the request' },
    })

    expect(toFriendlyWeb3Error(error)).toEqual({
      kind: 'user-rejected',
      message: 'The request was rejected in your wallet.',
    })
  })

  it('recognizes pending requests and insufficient funds', () => {
    expect(toFriendlyWeb3Error({ code: -32002 })).toMatchObject({ kind: 'request-pending' })
    expect(toFriendlyWeb3Error(new Error('insufficient funds for gas'))).toMatchObject({
      kind: 'insufficient-funds',
    })
  })

  it('falls back to a safe generic message', () => {
    expect(toFriendlyWeb3Error(new Error('unexpected'))).toMatchObject({ kind: 'unknown' })
  })
})
