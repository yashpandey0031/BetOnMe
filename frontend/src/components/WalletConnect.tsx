"use client";

import { useEffect, useState } from "react";
import { MONAD_CHAIN } from "@/lib/constants";
import { shortAddress } from "@/lib/utils";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

export default function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="rounded-md border border-primary/70 bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primarySoft"
        disabled
      >
        Connect MetaMask
      </button>
    );
  }

  const wrongChain = isConnected && chainId !== MONAD_CHAIN.id;

  if (!isConnected) {
    return (
      <button
        className="rounded-md border border-primary/70 bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primarySoft"
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isPending}
      >
        {isPending ? "Connecting..." : "Connect MetaMask"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {wrongChain && (
        <button
          onClick={() => switchChain({ chainId: MONAD_CHAIN.id })}
          disabled={isSwitchPending}
          className="rounded-md border border-yellow-500/50 bg-yellow-500/20 px-3 py-2 text-xs font-semibold text-yellow-200 transition hover:bg-yellow-500/30"
        >
          {isSwitchPending ? "Switching..." : "Switch to Monad"}
        </button>
      )}
      <button
        onClick={() => disconnect()}
        className="mono-data rounded-md border border-white/20 bg-panel px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
      >
        {shortAddress(address || "")}
      </button>
    </div>
  );
}
