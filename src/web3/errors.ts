export type Web3ErrorKind =
  | 'user-rejected'
  | 'request-pending'
  | 'wallet-unavailable'
  | 'chain-unsupported'
  | 'insufficient-funds'
  | 'rpc-unavailable'
  | 'transaction-reverted'
  | 'unknown'

export interface FriendlyWeb3Error {
  kind: Web3ErrorKind
  message: string
}

interface ErrorLike {
  code?: unknown
  message?: unknown
  shortMessage?: unknown
  cause?: unknown
}

function collectErrorDetails(error: unknown) {
  const messages: string[] = []
  const codes: unknown[] = []
  const visited = new Set<unknown>()
  let current = error

  while (current && !visited.has(current)) {
    visited.add(current)

    if (typeof current === 'object') {
      const candidate = current as ErrorLike
      if (typeof candidate.shortMessage === 'string') messages.push(candidate.shortMessage)
      if (typeof candidate.message === 'string') messages.push(candidate.message)
      if (candidate.code !== undefined) codes.push(candidate.code)
      current = candidate.cause
    } else {
      messages.push(String(current))
      break
    }
  }

  return { codes, message: messages.join(' ').toLowerCase() }
}

export function toFriendlyWeb3Error(error: unknown): FriendlyWeb3Error {
  const { codes, message } = collectErrorDetails(error)

  if (codes.includes(4001) || message.includes('user rejected') || message.includes('user denied')) {
    return { kind: 'user-rejected', message: 'The request was rejected in your wallet.' }
  }

  if (codes.includes(-32002) || message.includes('already pending')) {
    return {
      kind: 'request-pending',
      message: 'A wallet request is already open. Check MetaMask to continue.',
    }
  }

  if (codes.includes(4902) || message.includes('unrecognized chain')) {
    return {
      kind: 'chain-unsupported',
      message: 'Sepolia is not available in this wallet.',
    }
  }

  if (message.includes('insufficient funds')) {
    return {
      kind: 'insufficient-funds',
      message: 'The wallet does not have enough Sepolia ETH for the value and network fee.',
    }
  }

  if (message.includes('revert')) {
    return {
      kind: 'transaction-reverted',
      message: 'The transaction was reverted by the network.',
    }
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('timeout')
  ) {
    return {
      kind: 'rpc-unavailable',
      message: 'The Sepolia RPC endpoint is unavailable. Please try again.',
    }
  }

  if (message.includes('provider') && message.includes('not found')) {
    return {
      kind: 'wallet-unavailable',
      message: 'No compatible browser wallet was found.',
    }
  }

  return {
    kind: 'unknown',
    message: 'Something went wrong. Please check your wallet and try again.',
  }
}
