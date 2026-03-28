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

  useEffect(() => {
    const id = setInterval(() => {
      refetchCount();
      loadProfiles();
    }, 7000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchCount, count]);

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
      <div className="mb-8 rounded-2xl border border-white/10 bg-heroGrid bg-[length:22px_22px] bg-panel p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Restore Trust and Accountability
        </p>
        <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
          VeriStake: Decentralized Credibility Layer
        </h2>
        <p className="max-w-3xl text-sm text-white/70 md:text-base">
          Credibility should be earned continuously. Stake FOR reliable voices.
          Stake AGAINST unreliable claims. On Monad testnet, every action
          updates reputation in near real time.
        </p>
        <div className="mt-5">
          <Link
            href="/profile/create"
            className="inline-flex rounded-md border border-primary/60 bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primarySoft"
          >
            Create a Profile
          </Link>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          Live Reputation Market
        </h3>
        <span className="text-sm text-white/60">{count} profiles</span>
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
