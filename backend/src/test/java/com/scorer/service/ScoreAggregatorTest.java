package com.scorer.service;

import com.scorer.model.ScoreTier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link ScoreAggregator}: the function that combines the
 * five pillar scores into a total out of 100 and classifies that total
 * into a performance tier.
 *
 * Tier bands (lower bound inclusive):
 *   90-100  -> Exceptional
 *   80-89   -> High Performer
 *   60-79   -> Promising
 *   0-59    -> Developing
 */
class ScoreAggregatorTest {

    @Nested
    @DisplayName("calculateTotal")
    class CalculateTotal {

        @Test
        @DisplayName("sums all five pillar scores correctly")
        void sumsAllFivePillars() {
            int total = ScoreAggregator.calculateTotal(20, 18, 15, 12, 10);
            assertThat(total).isEqualTo(75);
        }

        @Test
        @DisplayName("returns 0 when all pillars are 0")
        void returnsZeroForAllZeroPillars() {
            int total = ScoreAggregator.calculateTotal(0, 0, 0, 0, 0);
            assertThat(total).isZero();
        }

        @Test
        @DisplayName("returns 100 for a perfect score across all pillars")
        void returnsHundredForPerfectScore() {
            int total = ScoreAggregator.calculateTotal(20, 20, 20, 20, 20);
            assertThat(total).isEqualTo(100);
        }

        @Test
        @DisplayName("treats null pillars as 0 rather than throwing")
        void treatsNullPillarsAsZero() {
            int total = ScoreAggregator.calculateTotal(15, null, 10, null, null);
            assertThat(total).isEqualTo(25);
        }

        @Test
        @DisplayName("returns 0 when every pillar is null")
        void returnsZeroWhenAllPillarsNull() {
            int total = ScoreAggregator.calculateTotal(null, null, null, null, null);
            assertThat(total).isZero();
        }
    }

    @Nested
    @DisplayName("calculateTier boundaries")
    class CalculateTierBoundaries {

        @ParameterizedTest(name = "total={0} -> {1}")
        @DisplayName("classifies totals correctly at and around every tier boundary")
        @CsvSource({
            // Exceptional: 90-100 (lower bound inclusive)
            "100, EXCEPTIONAL",
            "90,  EXCEPTIONAL",
            // boundary just below Exceptional
            "89,  HIGH_PERFORMER",
            // High Performer: 80-89
            "85,  HIGH_PERFORMER",
            "80,  HIGH_PERFORMER",
            // boundary just below High Performer
            "79,  PROMISING",
            // Promising: 60-79
            "70,  PROMISING",
            "60,  PROMISING",
            // boundary just below Promising
            "59,  DEVELOPING",
            // Developing: below 60
            "30,  DEVELOPING",
            "0,   DEVELOPING",
        })
        void classifiesTotalsAtBoundaries(int total, ScoreTier expectedTier) {
            assertThat(ScoreAggregator.calculateTier(total)).isEqualTo(expectedTier);
        }

        @Test
        @DisplayName("classifies an out-of-range value above 100 as Exceptional rather than throwing")
        void classifiesAboveHundredAsExceptional() {
            assertThat(ScoreAggregator.calculateTier(110)).isEqualTo(ScoreTier.EXCEPTIONAL);
        }

        @Test
        @DisplayName("classifies a negative value as Developing rather than throwing")
        void classifiesNegativeAsDeveloping() {
            assertThat(ScoreAggregator.calculateTier(-5)).isEqualTo(ScoreTier.DEVELOPING);
        }
    }

    @Nested
    @DisplayName("end-to-end aggregation (total + tier together)")
    class EndToEndAggregation {

        @Test
        @DisplayName("a strong submission lands in High Performer with the correct total")
        void strongSubmissionLandsInHighPerformer() {
            int total = ScoreAggregator.calculateTotal(18, 17, 16, 15, 14);
            ScoreTier tier = ScoreAggregator.calculateTier(total);

            assertThat(total).isEqualTo(80);
            assertThat(tier).isEqualTo(ScoreTier.HIGH_PERFORMER);
        }

        @Test
        @DisplayName("a weak submission lands in Developing with the correct total")
        void weakSubmissionLandsInDeveloping() {
            int total = ScoreAggregator.calculateTotal(5, 4, 3, 2, 1);
            ScoreTier tier = ScoreAggregator.calculateTier(total);

            assertThat(total).isEqualTo(15);
            assertThat(tier).isEqualTo(ScoreTier.DEVELOPING);
        }

        @Test
        @DisplayName("a submission landing exactly on the Exceptional boundary (total = 90) is classified Exceptional")
        void exactlyNinetyIsExceptional() {
            int total = ScoreAggregator.calculateTotal(20, 20, 20, 20, 10);
            ScoreTier tier = ScoreAggregator.calculateTier(total);

            assertThat(total).isEqualTo(90);
            assertThat(tier).isEqualTo(ScoreTier.EXCEPTIONAL);
        }

        @Test
        @DisplayName("a submission landing exactly on the Promising boundary (total = 60) is classified Promising")
        void exactlySixtyIsPromising() {
            int total = ScoreAggregator.calculateTotal(12, 12, 12, 12, 12);
            ScoreTier tier = ScoreAggregator.calculateTier(total);

            assertThat(total).isEqualTo(60);
            assertThat(tier).isEqualTo(ScoreTier.PROMISING);
        }
    }
}
