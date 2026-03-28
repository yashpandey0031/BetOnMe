"use client";

import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { MONAD_CHAIN } from "@/lib/constants";

export const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [MONAD_CHAIN],
  connectors: [injected()],
  transports: {
    [MONAD_CHAIN.id]: http(MONAD_CHAIN.rpcUrls.default.http[0]),
  },
});
