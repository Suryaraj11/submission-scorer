package com.scorer.service;

import com.scorer.model.ScoreTier;

/**
 * Pure aggregation logic for combining the five pillar scores into a
 * total out of 100 and classifying that total into a performance tier.
 *
 * Deliberately framework-free (no Spring annotations, no JPA) so it can
 * be unit tested in isolation without bootstrapping any application
 * context.
 *
 * Tier bands (lower bound inclusive):
 *   90-100  -> Exceptional
 *   80-89   -> High Performer
 *   60-79   -> Promising
 *   0-59    -> Developing
 */
public final class ScoreAggregator {

    private ScoreAggregator() {
        // static utility class, not instantiable
    }

    /**
     * Sums the five pillar scores into a total out of 100.
     * Null pillars are treated as 0 so a partially-scored draft still
     * produces a sane (if incomplete) total rather than throwing.
     */
    public static int calculateTotal(
            Integer analyticalRigourScore,
            Integer commercialAcumenScore,
            Integer qualityOfOutputScore,
            Integer communicationScore,
            Integer initiativeOwnershipScore
    ) {
        return nullToZero(analyticalRigourScore)
                + nullToZero(commercialAcumenScore)
                + nullToZero(qualityOfOutputScore)
                + nullToZero(communicationScore)
                + nullToZero(initiativeOwnershipScore);
    }

    /**
     * Classifies a total score (expected range 0-100, but tolerant of
     * out-of-range values) into a performance tier.
     */
    public static ScoreTier calculateTier(int total) {
        if (total >= 90) return ScoreTier.EXCEPTIONAL;
        if (total >= 80) return ScoreTier.HIGH_PERFORMER;
        if (total >= 60) return ScoreTier.PROMISING;
        return ScoreTier.DEVELOPING;
    }

    private static int nullToZero(Integer value) {
        return value == null ? 0 : value;
    }
}
