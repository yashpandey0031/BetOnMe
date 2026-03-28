import Link from "next/link";
import {
  getDefaultPlaceholderByProfileId,
  isPlaceholderImage,
} from "@/lib/profileImages";
import { ProfileData } from "@/lib/types";
import { formatMon, formatScore } from "@/lib/utils";

type Props = {
  profile: ProfileData;
};

export default function ProfileCard({ profile }: Props) {
  const forRatio =
    profile.totalStake > 0n
      ? (Number(profile.forStake) / Number(profile.totalStake)) * 100
      : 50;
  const placeholderImage = isPlaceholderImage(profile.imageUrl);

  return (
    <Link
      href={`/profile/${profile.id.toString()}`}
      className="glass-card group overflow-hidden p-5 shadow-glow transition hover:-translate-y-1"
    >
      <div className="mb-4 overflow-hidden rounded-lg border border-white/10 bg-panelSoft aspect-video">
        <img
          src={profile.imageUrl}
          alt={`${profile.name} profile image`}
          className={`h-full w-full transition duration-300 group-hover:scale-[1.02] ${
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

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-3xl font-semibold text-white">{profile.name}</h3>
        <span className="mono-data rounded-full bg-primary/20 px-2 py-1 text-xs font-semibold text-primary">
          #{profile.id.toString()}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-white/70">
        {profile.description}
      </p>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-white/60">
          <span>Credibility Conviction</span>
          <span className="mono-data">{forRatio.toFixed(1)}% FOR</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-panelSoft">
          <div
            className="h-full bg-positive transition-all duration-500"
            style={{ width: `${forRatio}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-panelSoft/90 p-3">
          <p className="text-white/60">Reputation</p>
          <p className="mono-data text-base font-semibold text-white">
            {formatScore(profile.reputationScore)}
          </p>
        </div>
        <div className="rounded-lg bg-panelSoft/90 p-3">
          <p className="text-white/60">Total Stake</p>
          <p className="mono-data text-base font-semibold text-white">
            {formatMon(profile.totalStake)} MON
          </p>
        </div>
      </div>
    </Link>
  );
}
