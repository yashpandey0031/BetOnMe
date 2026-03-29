"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePublicClient, useReadContract, useWatchContractEvent } from "wagmi";
import ProfileCard from "@/components/ProfileCard";
import { veriStakeAbi } from "@/lib/abi";
import { VERISTAKE_ADDRESS } from "@/lib/constants";
import { ProfileData } from "@/lib/types";

// Default placeholder images for fallback
const PLACEHOLDER_IMAGES = [
  "/download%20(4).jpg",
  "/download%20(5).jpg",
  "/Alternates%20in%20graphics%20variants%20%F0%9F%A4%9F%F0%9F%8F%BD%E2%9C%A8_%23art%20%23cameraroll.jpg",
  "/%D0%9D%D0%B0%20%D0%B0%D0%B2%D1%83.jpg",
  "/placeholder-5.svg",
];

const REQUEST_BATCH_SIZE = 4;
const BATCH_DELAY_MS = 120;

const legacyGetProfileAbi = [
  {
    inputs: [{ internalType: "uint256", name: "profileId", type: "uint256" }],
    name: "getProfile",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "forStake", type: "uint256" },
      { internalType: "uint256", name: "againstStake", type: "uint256" },
      { internalType: "uint256", name: "totalStake", type: "uint256" },
      { internalType: "uint256", name: "reputationScore", type: "uint256" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

function isSafeImageUrl(value: string) {
  if (!value || value.length > 2048) return false;
  if (value.includes("\u0000")) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  );
}

function isValidV2ProfileTuple(
  tuple: [
    string,
    string,
    string,
    bigint,
    bigint,
    bigint,
    bigint,
    string,
    bigint,
  ],
) {
  const forStake = tuple[3];
  const againstStake = tuple[4];
  const totalStake = tuple[5];
  const reputationScore = tuple[6];
  const imageUrl = tuple[2];

  const totalsMatch = forStake + againstStake === totalStake;
  const reputationRangeOk = reputationScore >= 0n && reputationScore <= 10000n;

  return totalsMatch && reputationRangeOk && isSafeImageUrl(imageUrl);
}

function isValidLegacyProfileTuple(
  tuple: [string, string, bigint, bigint, bigint, bigint, string, bigint],
) {
  const forStake = tuple[2];
  const againstStake = tuple[3];
  const totalStake = tuple[4];
  const reputationScore = tuple[5];

  const totalsMatch = forStake + againstStake === totalStake;
  const reputationRangeOk = reputationScore >= 0n && reputationScore <= 10000n;

  return totalsMatch && reputationRangeOk;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function HomePage() {
  const publicClient = usePublicClient();
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { data: profileCount, refetch: refetchCount } = useReadContract({
    address: VERISTAKE_ADDRESS,
    abi: veriStakeAbi,
    functionName: "profileCount",
  });

  const count = useMemo(() => Number(profileCount || 0n), [profileCount]);

  async function readProfileById(i: number) {
    if (!publicClient) return null;

    const fallbackImage = PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length];

    try {
      const result = (await publicClient.readContract({
        address: VERISTAKE_ADDRESS,
        abi: veriStakeAbi,
        functionName: "getProfile",
        args: [BigInt(i)],
      })) as [
        string,
        string,
        string,
        bigint,
        bigint,
        bigint,
        bigint,
        string,
        bigint,
      ];

      if (isValidV2ProfileTuple(result)) {
        return {
          id: BigInt(i),
          imageUrl: result[2],
          name: result[0],
          description: result[1],
          forStake: result[3],
          againstStake: result[4],
          totalStake: result[5],
          reputationScore: result[6],
          creator: result[7],
          createdAt: result[8],
        } satisfies ProfileData;
      }
    } catch {
      // Fall through to legacy reader.
    }

    try {
      const legacy = (await publicClient.readContract({
        address: VERISTAKE_ADDRESS,
        abi: legacyGetProfileAbi,
        functionName: "getProfile",
        args: [BigInt(i)],
      })) as [string, string, bigint, bigint, bigint, bigint, string, bigint];

      if (!isValidLegacyProfileTuple(legacy)) {
        return {
          id: BigInt(i),
          imageUrl: fallbackImage,
          name: legacy[0] || `Profile #${i}`,
          description: legacy[1] || "No description",
          forStake: 0n,
          againstStake: 0n,
          totalStake: 0n,
          reputationScore: 5000n,
          creator: "0x0000000000000000000000000000000000000000",
          createdAt: 0n,
        } satisfies ProfileData;
      }

      return {
        id: BigInt(i),
        imageUrl: fallbackImage,
        name: legacy[0],
        description: legacy[1],
        forStake: legacy[2],
        againstStake: legacy[3],
        totalStake: legacy[4],
        reputationScore: legacy[5],
        creator: legacy[6],
        createdAt: legacy[7],
      } satisfies ProfileData;
    } catch {
      // Skip profiles that fail due to temporary RPC throttling.
      return null;
    }
  }

  async function loadProfiles(profileTotal: number) {
    if (!publicClient || profileTotal <= 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ids = [...Array(profileTotal).keys()];

    try {
      const collected: ProfileData[] = [];

      for (let index = 0; index < ids.length; index += REQUEST_BATCH_SIZE) {
        const batchIds = ids.slice(index, index + REQUEST_BATCH_SIZE);
        const batch = await Promise.all(
          batchIds.map((i) => readProfileById(i)),
        );
        collected.push(
          ...batch.filter((item): item is ProfileData => item !== null),
        );

        if (index + REQUEST_BATCH_SIZE < ids.length) {
          await delay(BATCH_DELAY_MS);
        }
      }

      setProfiles(collected.reverse());
    } finally {
      setLoading(false);
    }
  }

  async function refreshMarket() {
    if (!publicClient) return;
    setRefreshing(true);
    try {
      const result = await refetchCount();
      const latestCount = Number(result.data ?? 0n);
      await loadProfiles(latestCount);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!publicClient) return;
    loadProfiles(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, count]);

  useWatchContractEvent({
    address: VERISTAKE_ADDRESS,
    abi: veriStakeAbi,
    eventName: "ProfileCreated",
    onLogs: () => {
      refreshMarket();
    },
  });

  return (
    <section>
      <div className="mb-8 overflow-hidden bg-heroGrid bg-[length:20px_20px] p-7 md:p-9">
        <div className="relative z-10 max-w-5xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            BetOnMe Protocol
          </p>
          <h2 className="mb-3 text-4xl font-bold text-white md:text-6xl">
            Bet On Your Reputation.
            <span className="block text-white/80">
              Or Someone Else&apos;s...
            </span>
          </h2>
          <p className="max-w-4xl text-sm text-white/70 md:text-lg">
            BetOnMe turns reputation into something you can actually bet on.
            Stake FOR someone you trust. Stake AGAINST someone you don't.
            Everything on-chain, everything public.
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

      <div className="w-full">
        <div id="market" className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">
            Live Reputation Market
          </h3>
          <div className="flex items-center gap-3">
            <span className="mono-data text-sm text-white/60">
              {count} profiles
            </span>
            <button
              type="button"
              onClick={refreshMarket}
              disabled={refreshing}
              className="rounded-md border border-white/25 bg-panel/70 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/45 disabled:opacity-40"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-7">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id.toString()} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
