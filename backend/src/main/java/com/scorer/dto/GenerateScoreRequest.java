package com.scorer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateScoreRequest {
    @NotBlank
    private String submissionId;

    @NotBlank
    private String submissionText;
}
