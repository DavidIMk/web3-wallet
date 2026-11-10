import type { Address } from 'viem'

export function shortenAddress(address: Address, visible = 5) {
  return `${address.slice(0, visible + 2)}…${address.slice(-visible)}`
}

export function formatTokenAmount(value: string, maximumFractionDigits = 4) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return value
  if (numericValue === 0) return '0'
  if (numericValue < 0.0001) return '<0.0001'

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(numericValue)
}

export function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Unknown time'

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
