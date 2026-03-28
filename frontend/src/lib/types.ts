export type ProfileData = {
  id: bigint;
  imageUrl: string;
  name: string;
  description: string;
  forStake: bigint;
  againstStake: bigint;
  totalStake: bigint;
  reputationScore: bigint;
  creator: string;
  createdAt: bigint;
};
