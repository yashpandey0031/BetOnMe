"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import StakePanel from "@/components/StakePanel";
import { veriStakeAbi } from "@/lib/abi";
import { VERISTAKE_ADDRESS } from "@/lib/constants";
import {
  getDefaultPlaceholderByProfileId,
  isPlaceholderImage,
} from "@/lib/profileImages";
import { ProfileData } from "@/lib/types";
import { formatMon, formatScore, shortAddress } from "@/lib/utils";

// Default placeholder images for fallback
const PLACEHOLDER_IMAGES = [
  "/download%20(4).jpg",
  "/download%20(5).jpg",
  "/Alternates%20in%20graphics%20variants%20%F0%9F%A4%9F%F0%9F%8F%BD%E2%9C%A8_%23art%20%23cameraroll.jpg",
  "/%D0%9D%D0%B0%20%D0%B0%D0%B2%D1%83.jpg",
  "/placeholder-5.svg",
];

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

type StakeLog = {
  profileId: bigint;
  user: string;
  isFor: boolean;
  amount: bigint;
  evidence: string;
  timestamp: bigint;
};

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

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const rawProfileId = params.id || "0";
  const isNumericProfileId = /^\d+$/.test(rawProfileId);
  const profileId = isNumericProfileId ? BigInt(rawProfileId) : 0n;
  const publicClient = usePublicClient();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recentLogs, setRecentLogs] = useState<StakeLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!publicClient || !isNumericProfileId) return;

    try {
      setLoading(true);

      const fallbackImage =
        PLACEHOLDER_IMAGES[Number(profileId) % PLACEHOLDER_IMAGES.length];

      let parsedProfile: ProfileData;
      try {
        const result = (await publicClient.readContract({
          address: VERISTAKE_ADDRESS,
          abi: veriStakeAbi,
          functionName: "getProfile",
          args: [profileId],
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

        if (!isValidV2ProfileTuple(result)) {
          throw new Error("Invalid v2 profile tuple");
        }

        parsedProfile = {
          id: profileId,
          imageUrl: result[2],
          name: result[0],
          description: result[1],
          forStake: result[3],
          againstStake: result[4],
          totalStake: result[5],
          reputationScore: result[6],
          creator: result[7],
          createdAt: result[8],
        };
      } catch {
        const legacy = (await publicClient.readContract({
          address: VERISTAKE_ADDRESS,
          abi: legacyGetProfileAbi,
          functionName: "getProfile",
          args: [profileId],
        })) as [string, string, bigint, bigint, bigint, bigint, string, bigint];

        if (!isValidLegacyProfileTuple(legacy)) {
          throw new Error("Invalid legacy profile tuple");
        }

        parsedProfile = {
          id: profileId,
          imageUrl: fallbackImage,
          name: legacy[0],
          description: legacy[1],
          forStake: legacy[2],
          againstStake: legacy[3],
          totalStake: legacy[4],
          reputationScore: legacy[5],
          creator: legacy[6],
          createdAt: legacy[7],
        };
      }

      setProfile(parsedProfile);

      const historyCount = (await publicClient.readContract({
        address: VERISTAKE_ADDRESS,
        abi: veriStakeAbi,
        functionName: "getStakeHistoryCount",
        args: [profileId],
      })) as bigint;

      const total = Number(historyCount);
      if (total === 0) {
        setRecentLogs([]);
        return;
      }

      const indices = [...Array(total).keys()];
      const actions = await Promise.all(
        indices.map(async (index) => {
          const action = (await publicClient.readContract({
            address: VERISTAKE_ADDRESS,
            abi: veriStakeAbi,
            functionName: "getStakeAction",
            args: [profileId, BigInt(index)],
          })) as {
            user: string;
            profileId: bigint;
            isFor: boolean;
            amount: bigint;
            evidence: string;
            timestamp: bigint;
          };

          return {
            profileId: action.profileId,
            user: action.user,
            isFor: action.isFor,
            amount: action.amount,
            evidence: action.evidence || "No evidence",
            timestamp: action.timestamp,
          } satisfies StakeLog;
        }),
      );

      setRecentLogs(actions.reverse());
    } catch {
      setProfile(null);
      setRecentLogs([]);
    } finally {
      setLoading(false);
    }
  }, [isNumericProfileId, profileId, publicClient]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useWatchContractEvent({
    address: VERISTAKE_ADDRESS,
    abi: veriStakeAbi,
    eventName: "Staked",
    onLogs: (logs) => {
      const affectsCurrent = logs.some(
        (log) => log.args.profileId === profileId,
      );
      if (affectsCurrent) {
        loadProfile();
      }
    },
  });

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-panel p-8 text-white/70">
        Loading profile...
      </div>
    );
  }

  if (!isNumericProfileId) {
    return (
      <div className="rounded-xl border border-white/10 bg-panel p-8 text-white/70">
        Invalid profile id.{" "}
        <Link href="/" className="text-primary">
          Return home
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-white/10 bg-panel p-8 text-white/70">
        Profile not found.{" "}
        <Link href="/" className="text-primary">
          Return home
        </Link>
      </div>
    );
  }

  const forRatio =
    profile.totalStake > 0n
      ? (Number(profile.forStake) / Number(profile.totalStake)) * 100
      : 50;
  const scorePercent = Number(profile.reputationScore) / 100;
  const placeholderImage = isPlaceholderImage(profile.imageUrl);

  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="glass-card p-5 shadow-glow">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-panelSoft sm:w-64">
              <img
                src={profile.imageUrl}
                alt={`${profile.name} profile image`}
                className={`h-56 w-full sm:h-full ${
                  placeholderImage
                    ? "object-contain bg-gradient-to-br from-panelSoft to-panel p-4"
                    : "object-cover"
                }`}
                onError={(event) => {
                  event.currentTarget.src = getDefaultPlaceholderByProfileId(
                    profile.id,
                  );
                }}
              />
            </div>
            <div className="flex-1">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/55">
                Credibility Market
              </p>
              <h2 className="text-4xl font-bold text-white">{profile.name}</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-white/75">
                {profile.description}
              </p>
              <p className="mono-data mt-4 text-xs text-white/50">
                Created by {shortAddress(profile.creator)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="glass-card flex items-center justify-center p-4 sm:col-span-2">
            <div
              className="relative h-32 w-32 rounded-full"
              style={{
                background: `conic-gradient(#14f195 ${scorePercent}%, #9945ff ${scorePercent}% 100%)`,
              }}
            >
              <div className="absolute inset-[8px] flex flex-col items-center justify-center rounded-full bg-bg">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Score
                </p>
                <p className="mono-data text-2xl font-bold text-white">
                  {formatScore(profile.reputationScore)}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-white/55">
              FOR Stake
            </p>
            <p className="mono-data mt-2 text-2xl font-bold text-positive">
              {formatMon(profile.forStake)} MON
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-white/55">
              AGAINST Stake
            </p>
            <p className="mono-data mt-2 text-2xl font-bold text-negative">
              {formatMon(profile.againstStake)} MON
            </p>
          </div>
        </div>

        <div className="glass-card mt-5 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-white/60">
            <span>Community Conviction</span>
            <span className="mono-data">{forRatio.toFixed(1)}% FOR</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-panelSoft">
            <div
              className="h-full bg-positive transition-all duration-500"
              style={{ width: `${forRatio}%` }}
            />
          </div>
        </div>

        <div className="glass-card mt-5 p-4">
          <h3 className="mb-3 text-base font-semibold text-white">
            Recent Evidence-Backed Activity
          </h3>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-white/60">No stake activity yet.</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log, index) => (
                <div
                  key={`${log.user}-${index}`}
                  className="rounded-md border border-white/10 bg-panelSoft p-3 text-sm text-white/80"
                >
                  <p
                    className={`mono-data ${log.isFor ? "text-positive" : "text-negative"}`}
                  >
                    {log.isFor ? "FOR" : "AGAINST"} by {shortAddress(log.user)}{" "}
                    - {formatMon(log.amount)} MON
                  </p>
                  <p className="mt-1 text-xs text-white/70">{log.evidence}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <StakePanel
          profileId={profileId}
          onActionCompletedAction={loadProfile}
        />
      </div>
    </section>
  );
}
