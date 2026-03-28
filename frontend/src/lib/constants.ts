import { Address } from "viem";

const FALLBACK_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

export const VERISTAKE_ADDRESS =
  (process.env.NEXT_PUBLIC_VERISTAKE_ADDRESS as Address | undefined) ??
  FALLBACK_ADDRESS;

export const MONAD_CHAIN = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MONAD_RPC_URL ||
          "https://testnet-rpc.monad.xyz",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
} as const;

export const EVIDENCE_THRESHOLD_ETH = 0.02;
