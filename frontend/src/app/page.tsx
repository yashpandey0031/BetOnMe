"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePublicClient, useReadContract, useWatchContractEvent } from "wagmi";
import ProfileCard from "@/components/ProfileCard";
import { veriStakeAbi } from "@/lib/abi";
import { VERISTAKE_ADDRESS } from "@/lib/constants";
import { getProfileImageForId } from "@/lib/profileImages";
import { ProfileData } from "@/lib/types";

export default function HomePage() {
  const publicClient = usePublicClient();
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: profileCount, refetch: refetchCount } = useReadContract({
    address: VERISTAKE_ADDRESS,
    abi: veriStakeAbi,
    functionName: "profileCount",
  });

  const count = useMemo(() => Number(profileCount || 0n), [profileCount]);

  async function loadProfiles() {
    if (!publicClient || count <= 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ids = [...Array(count).keys()];

    const data = await Promise.all(
      ids.map(async (i) => {
        const result = (await publicClient.readContract({
          address: VERISTAKE_ADDRESS,
          abi: veriStakeAbi,
          functionName: "getProfile",
          args: [BigInt(i)],
        })) as [string, string, bigint, bigint, bigint, bigint, string, bigint];

        return {
          id: BigInt(i),
          imageUrl: getProfileImageForId(BigInt(i)),
          name: result[0],
          description: result[1],
          forStake: result[2],
          againstStake: result[3],
          totalStake: result[4],
          reputationScore: result[5],
          creator: result[6],
          createdAt: result[7],
        } satisfies ProfileData;
      }),
    );

    setProfiles(data.reverse());
    setLoading(false);
  }

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, publicClient]);

  useWatchContractEvent({
    address: VERISTAKE_ADDRESS,
    abi: veriStakeAbi,
    eventName: "ProfileCreated",
    onLogs: () => {
      refetchCount();
      loadProfiles();
    },
  });

  return (
    <section>
      <div className="glass-card mb-8 overflow-hidden bg-heroGrid bg-[length:20px_20px] p-7 shadow-glow md:p-9">
        <div className="relative z-10 max-w-4xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            BetOnMe Protocol
          </p>
          <h2 className="mb-3 text-4xl font-bold text-white md:text-6xl">
            Bet On Your Reputation.
            <span className="block text-white/80">
              Your Reputation Is At Stake.
            </span>
          </h2>
          <p className="max-w-3xl text-sm text-white/70 md:text-lg">
            BetOnMe turns credibility into a live market signal. Stake FOR
            trust, stake AGAINST falsehoods, and make accountability visible in
            public.
          </p>
          <p className="mt-3 mono-data text-xs uppercase tracking-[0.22em] text-white/50">
            Evidence-backed conviction on Monad testnet
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/profile/create"
              className="inline-flex rounded-md border border-primary/60 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primarySoft"
            >
              Create a Profile
            </Link>
            <a
              href="#market"
              className="inline-flex rounded-md border border-white/25 bg-panel/60 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/45"
            >
              Explore Live Market
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-28 h-64 w-64 rounded-full bg-positive/20 blur-3xl" />
      </div>

      <div id="market" className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          Live Reputation Market
        </h3>
        <span className="mono-data text-sm text-white/60">
          {count} profiles
        </span>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-panel p-8 text-center text-white/70">
          Loading profiles...
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-panel p-8 text-center text-white/70">
          No profiles yet. Create the first credibility market.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id.toString()} profile={profile} />
          ))}
        </div>
      )}
    </section>
  );
}
