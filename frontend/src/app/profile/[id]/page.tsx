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
  getProfileImageForId,
  isPlaceholderImage,
} from "@/lib/profileImages";
import { ProfileData } from "@/lib/types";
import { formatMon, formatScore, shortAddress } from "@/lib/utils";

type StakeLog = {
  profileId: bigint;
  user: string;
  isFor: boolean;
  amount: bigint;
  evidence: string;
  timestamp: bigint;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const profileId = BigInt(params.id || "0");
  const publicClient = usePublicClient();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recentLogs, setRecentLogs] = useState<StakeLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!publicClient) return;

    try {
      setLoading(true);

      const result = (await publicClient.readContract({
        address: VERISTAKE_ADDRESS,
        abi: veriStakeAbi,
        functionName: "getProfile",
        args: [profileId],
      })) as [string, string, bigint, bigint, bigint, bigint, string, bigint];

      setProfile({
        id: profileId,
        imageUrl: getProfileImageForId(profileId),
        name: result[0],
        description: result[1],
        forStake: result[2],
        againstStake: result[3],
        totalStake: result[4],
        reputationScore: result[5],
        creator: result[6],
        createdAt: result[7],
      });

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
  }, [profileId, publicClient]);

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
