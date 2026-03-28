"use client";

import { useMemo, useState } from "react";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { veriStakeAbi } from "@/lib/abi";
import { EVIDENCE_THRESHOLD_ETH, VERISTAKE_ADDRESS } from "@/lib/constants";
import { delay } from "@/lib/utils";

type Props = {
  profileId: bigint;
  onActionCompletedAction: () => Promise<void>;
};

export default function StakePanel({
  profileId,
  onActionCompletedAction,
}: Props) {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount] = useState("0.01");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const evidenceRequired = useMemo(
    () => Number(amount || 0) >= EVIDENCE_THRESHOLD_ETH,
    [amount],
  );

  async function runStake(isFor: boolean) {
    if (!publicClient || !isConnected) return;
    if (evidenceRequired && reason.trim().length < 8) {
      setMessage("Evidence is required for stake >= 0.02 MON.");
      return;
    }

    try {
      setBusy(true);
      setMessage("Submitting stake transaction...");

      const hash = await writeContractAsync({
        address: VERISTAKE_ADDRESS,
        abi: veriStakeAbi,
        functionName: "stake",
        args: [profileId, isFor, reason],
        value: parseEther(amount),
      });

      await publicClient.waitForTransactionReceipt({ hash });
      setMessage("Stake confirmed on Monad.");
      await onActionCompletedAction();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Transaction failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function runBurst() {
    if (!publicClient || !isConnected) return;
    if (reason.trim().length < 8) {
      setMessage("Please provide evidence for burst demo.");
      return;
    }

    try {
      setBusy(true);
      setMessage("Running Monad burst interaction...");

      const hash = await writeContractAsync({
        address: VERISTAKE_ADDRESS,
        abi: veriStakeAbi,
        functionName: "burstStake",
        args: [profileId, 5, 2, reason],
        value: parseEther("0.07"),
      });

      await publicClient.waitForTransactionReceipt({ hash });

      setMessage("Burst completed. Watching ultra-fast event updates...");
      await delay(300);
      await onActionCompletedAction();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Burst action failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-panel p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Stake Your Conviction
      </h3>

      <label className="mb-2 block text-sm text-white/80">Amount (MON)</label>
      <input
        type="number"
        step="0.001"
        min="0.001"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-4 w-full rounded-md border border-white/15 bg-panelSoft px-3 py-2 text-white outline-none transition focus:border-primary"
      />

      <label className="mb-2 block text-sm text-white/80">
        Evidence / Reason
      </label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Share why this profile is credible or unreliable."
        className="mb-4 h-24 w-full rounded-md border border-white/15 bg-panelSoft px-3 py-2 text-white outline-none transition focus:border-primary"
      />

      {evidenceRequired && (
        <p className="mb-4 rounded-md border border-yellow-500/40 bg-yellow-500/15 p-2 text-xs text-yellow-100">
          Evidence is mandatory for stake amounts above 0.02 MON.
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          onClick={() => runStake(true)}
          disabled={busy || !isConnected}
          className="rounded-md border border-positive/40 bg-positive/20 px-4 py-2 font-semibold text-positive transition hover:bg-positive/30 disabled:opacity-40"
        >
          Stake FOR
        </button>
        <button
          onClick={() => runStake(false)}
          disabled={busy || !isConnected}
          className="rounded-md border border-negative/40 bg-negative/20 px-4 py-2 font-semibold text-negative transition hover:bg-negative/30 disabled:opacity-40"
        >
          Stake AGAINST
        </button>
      </div>

      <button
        onClick={runBurst}
        disabled={busy || !isConnected}
        className="mt-3 w-full rounded-md border border-primary/50 bg-primary/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/35 disabled:opacity-40"
      >
        Monad Burst Interaction (5 FOR + 2 AGAINST)
      </button>

      {!isConnected && (
        <p className="mt-3 text-xs text-white/60">Connect MetaMask to stake.</p>
      )}
      {message && <p className="mt-3 text-xs text-white/80">{message}</p>}
    </div>
  );
}
