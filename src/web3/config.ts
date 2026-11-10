import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const configuredRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL?.trim()

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected({ shimDisconnect: true })],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: configuredRpcUrl ? http(configuredRpcUrl) : http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
