import { isAddress, parseEther } from 'viem'

export function validateEthTransfer(to: string, amount: string, balanceWei?: bigint) {
  if (!isAddress(to)) return 'Enter a valid Ethereum address.'

  let valueWei: bigint
  try {
    valueWei = parseEther(amount)
  } catch {
    return 'Enter a valid ETH amount with no more than 18 decimal places.'
  }

  if (valueWei <= 0n) return 'Amount must be greater than zero.'
  if (balanceWei !== undefined && valueWei >= balanceWei) {
    return 'Leave enough ETH in the wallet to pay the network fee.'
  }

  return null
}
