import Link from "next/link";
import { getDefaultPlaceholderByProfileId } from "@/lib/profileImages";
import { ProfileData } from "@/lib/types";
import { formatMon, formatScore } from "@/lib/utils";

type Props = {
  profile: ProfileData;
};

export default function ProfileCard({ profile }: Props) {
  return (
    <Link
      href={`/profile/${profile.id.toString()}`}
      className="group rounded-xl border border-white/10 bg-panel p-5 shadow-glow transition hover:-translate-y-1 hover:border-primary/70"
    >
      <div className="mb-4 overflow-hidden rounded-lg border border-white/10 bg-panelSoft">
        <img
          src={profile.imageUrl}
          alt={`${profile.name} profile image`}
          className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          onError={(event) => {
            event.currentTarget.src = getDefaultPlaceholderByProfileId(
              profile.id,
            );
          }}
        />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
        <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-semibold text-primary">
          #{profile.id.toString()}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-white/70">
        {profile.description}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-panelSoft p-3">
          <p className="text-white/60">Reputation</p>
          <p className="text-base font-semibold text-white">
            {formatScore(profile.reputationScore)}
          </p>
        </div>
        <div className="rounded-lg bg-panelSoft p-3">
          <p className="text-white/60">Total Stake</p>
          <p className="text-base font-semibold text-white">
            {formatMon(profile.totalStake)} MON
          </p>
        </div>
      </div>
    </Link>
  );
}
