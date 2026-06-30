package com.scorer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_id", nullable = false)
    private String submissionId;

    // Pillar scores (each out of 20)
    @Column(name = "analytical_rigour_score")
    private Integer analyticalRigourScore;

    @Column(name = "analytical_rigour_feedback", columnDefinition = "TEXT")
    private String analyticalRigourFeedback;

    @Column(name = "commercial_acumen_score")
    private Integer commercialAcumenScore;

    @Column(name = "commercial_acumen_feedback", columnDefinition = "TEXT")
    private String commercialAcumenFeedback;

    @Column(name = "quality_of_output_score")
    private Integer qualityOfOutputScore;

    @Column(name = "quality_of_output_feedback", columnDefinition = "TEXT")
    private String qualityOfOutputFeedback;

    @Column(name = "communication_score")
    private Integer communicationScore;

    @Column(name = "communication_feedback", columnDefinition = "TEXT")
    private String communicationFeedback;

    @Column(name = "initiative_ownership_score")
    private Integer initiativeOwnershipScore;

    @Column(name = "initiative_ownership_feedback", columnDefinition = "TEXT")
    private String initiativeOwnershipFeedback;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ScoreStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public int getTotalScore() {
        return com.scorer.service.ScoreAggregator.calculateTotal(
            analyticalRigourScore,
            commercialAcumenScore,
            qualityOfOutputScore,
            communicationScore,
            initiativeOwnershipScore
        );
    }

    public ScoreTier getTier() {
        return com.scorer.service.ScoreAggregator.calculateTier(getTotalScore());
    }
}
