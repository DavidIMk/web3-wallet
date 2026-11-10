import type { Address } from 'viem'
import { sepolia } from 'wagmi/chains'

export interface TokenConfig {
  address: Address
  chainId: number
  description: string
  expectedDecimals: number
  expectedSymbol: string
  faucetUrl?: string
}

export const trackedTokens: readonly TokenConfig[] = [
  {
    address: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    chainId: sepolia.id,
    description: 'Chainlink test token',
    expectedDecimals: 18,
    expectedSymbol: 'LINK',
    faucetUrl: 'https://faucets.chain.link/sepolia',
  },
] as const
