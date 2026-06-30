import { ScoreDto } from '../types';

export type ScoreTier = 'Exceptional' | 'High Performer' | 'Promising' | 'Developing';

export interface ScoreAggregate {
  total: number;
  tier: ScoreTier;
}

export const TIER_COLOR: Record<ScoreTier, string> = {
  'Exceptional': '#22c55e',
  'High Performer': '#3b82f6',
  'Promising': '#f59e0b',
  'Developing': '#ef4444',
};

/**
 * Pillar scores accepted by the aggregator. Each pillar is out of 20;
 * missing/undefined pillars are treated as 0 so a partially-scored
 * draft still produces a sane (if incomplete) total.
 */
export interface PillarScores {
  analyticalRigourScore?: number | null;
  commercialAcumenScore?: number | null;
  qualityOfOutputScore?: number | null;
  communicationScore?: number | null;
  initiativeOwnershipScore?: number | null;
}

/**
 * Sums the five pillar scores into a total out of 100 and classifies
 * that total into a tier.
 *
 * Tier bands (inclusive lower bound):
 *   90-100  -> Exceptional
 *   80-89   -> High Performer
 *   60-79   -> Promising
 *   0-59    -> Developing
 */
export const calculateTotal = (pillars: PillarScores): number => {
  const {
    analyticalRigourScore = 0,
    commercialAcumenScore = 0,
    qualityOfOutputScore = 0,
    communicationScore = 0,
    initiativeOwnershipScore = 0,
  } = pillars;

  return (
    (analyticalRigourScore ?? 0) +
    (commercialAcumenScore ?? 0) +
    (qualityOfOutputScore ?? 0) +
    (communicationScore ?? 0) +
    (initiativeOwnershipScore ?? 0)
  );
};

export const calculateTier = (total: number): ScoreTier => {
  if (total >= 90) return 'Exceptional';
  if (total >= 80) return 'High Performer';
  if (total >= 60) return 'Promising';
  return 'Developing';
};

/**
 * Convenience wrapper: computes both the total and tier from a
 * pillar-scores-shaped object (e.g. a ScoreDto) in one call.
 */
export const aggregateScore = (pillars: PillarScores): ScoreAggregate => {
  const total = calculateTotal(pillars);
  const tier = calculateTier(total);
  return { total, tier };
};

// Re-export typed for convenience when called with a full ScoreDto
export const aggregateScoreDto = (score: ScoreDto): ScoreAggregate => aggregateScore(score);
