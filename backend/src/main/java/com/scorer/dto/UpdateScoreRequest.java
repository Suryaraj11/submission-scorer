package com.scorer.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateScoreRequest {

    @Min(0) @Max(20)
    private Integer analyticalRigourScore;
    private String analyticalRigourFeedback;

    @Min(0) @Max(20)
    private Integer commercialAcumenScore;
    private String commercialAcumenFeedback;

    @Min(0) @Max(20)
    private Integer qualityOfOutputScore;
    private String qualityOfOutputFeedback;

    @Min(0) @Max(20)
    private Integer communicationScore;
    private String communicationFeedback;

    @Min(0) @Max(20)
    private Integer initiativeOwnershipScore;
    private String initiativeOwnershipFeedback;
}
