package com.scorer.dto;

import com.scorer.model.ScoreStatus;
import com.scorer.model.ScoreTier;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreDto {
    private Long id;
    private String submissionId;

    private Integer analyticalRigourScore;
    private String analyticalRigourFeedback;

    private Integer commercialAcumenScore;
    private String commercialAcumenFeedback;

    private Integer qualityOfOutputScore;
    private String qualityOfOutputFeedback;

    private Integer communicationScore;
    private String communicationFeedback;

    private Integer initiativeOwnershipScore;
    private String initiativeOwnershipFeedback;

    private Integer totalScore;
    private ScoreTier tier;
    private ScoreStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
}
