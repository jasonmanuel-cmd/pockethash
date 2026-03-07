export const REWARD_TIERS = [
  { points: 200, credit: 20 },
  { points: 500, credit: 100 },
  { points: 1000, credit: 200 },
] as const;

export type RewardTier = (typeof REWARD_TIERS)[number];

export function getRewardTier(points: number): RewardTier | null {
  return REWARD_TIERS.find((tier) => tier.points === points) ?? null;
}
