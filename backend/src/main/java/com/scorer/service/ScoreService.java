package com.scorer.service;

import com.scorer.dto.GenerateScoreRequest;
import com.scorer.dto.ScoreDto;
import com.scorer.dto.UpdateScoreRequest;
import com.scorer.model.Score;
import com.scorer.model.ScoreStatus;
import com.scorer.repository.ScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final AnthropicService anthropicService;

    @Transactional
    public ScoreDto generateDraftScore(GenerateScoreRequest request) {
        log.info("Generating draft score for submission: {}", request.getSubmissionId());

        ScoreDto aiScore = anthropicService.generateScore(request.getSubmissionText());

        Score score = Score.builder()
            .submissionId(request.getSubmissionId())
            .analyticalRigourScore(aiScore.getAnalyticalRigourScore())
            .analyticalRigourFeedback(aiScore.getAnalyticalRigourFeedback())
            .commercialAcumenScore(aiScore.getCommercialAcumenScore())
            .commercialAcumenFeedback(aiScore.getCommercialAcumenFeedback())
            .qualityOfOutputScore(aiScore.getQualityOfOutputScore())
            .qualityOfOutputFeedback(aiScore.getQualityOfOutputFeedback())
            .communicationScore(aiScore.getCommunicationScore())
            .communicationFeedback(aiScore.getCommunicationFeedback())
            .initiativeOwnershipScore(aiScore.getInitiativeOwnershipScore())
            .initiativeOwnershipFeedback(aiScore.getInitiativeOwnershipFeedback())
            .status(ScoreStatus.DRAFT)
            .build();

        Score saved = scoreRepository.save(score);
        return toDto(saved);
    }

    @Transactional
    public ScoreDto updateScore(Long scoreId, UpdateScoreRequest request) {
        Score score = scoreRepository.findById(scoreId)
            .orElseThrow(() -> new RuntimeException("Score not found: " + scoreId));

        if (score.getStatus() == ScoreStatus.PUBLISHED) {
            throw new IllegalStateException("Cannot edit a published score. Score is locked.");
        }

        if (request.getAnalyticalRigourScore() != null)
            score.setAnalyticalRigourScore(request.getAnalyticalRigourScore());
        if (request.getAnalyticalRigourFeedback() != null)
            score.setAnalyticalRigourFeedback(request.getAnalyticalRigourFeedback());

        if (request.getCommercialAcumenScore() != null)
            score.setCommercialAcumenScore(request.getCommercialAcumenScore());
        if (request.getCommercialAcumenFeedback() != null)
            score.setCommercialAcumenFeedback(request.getCommercialAcumenFeedback());

        if (request.getQualityOfOutputScore() != null)
            score.setQualityOfOutputScore(request.getQualityOfOutputScore());
        if (request.getQualityOfOutputFeedback() != null)
            score.setQualityOfOutputFeedback(request.getQualityOfOutputFeedback());

        if (request.getCommunicationScore() != null)
            score.setCommunicationScore(request.getCommunicationScore());
        if (request.getCommunicationFeedback() != null)
            score.setCommunicationFeedback(request.getCommunicationFeedback());

        if (request.getInitiativeOwnershipScore() != null)
            score.setInitiativeOwnershipScore(request.getInitiativeOwnershipScore());
        if (request.getInitiativeOwnershipFeedback() != null)
            score.setInitiativeOwnershipFeedback(request.getInitiativeOwnershipFeedback());

        // Move to REVIEWED state when edited
        if (score.getStatus() == ScoreStatus.DRAFT) {
            score.setStatus(ScoreStatus.REVIEWED);
        }

        Score updated = scoreRepository.save(score);
        return toDto(updated);
    }

    @Transactional
    public ScoreDto publishScore(Long scoreId) {
        Score score = scoreRepository.findById(scoreId)
            .orElseThrow(() -> new RuntimeException("Score not found: " + scoreId));

        if (score.getStatus() == ScoreStatus.PUBLISHED) {
            throw new IllegalStateException("Score is already published.");
        }

        score.setStatus(ScoreStatus.PUBLISHED);
        score.setPublishedAt(LocalDateTime.now());

        Score published = scoreRepository.save(score);
        return toDto(published);
    }

    public ScoreDto getScore(Long scoreId) {
        Score score = scoreRepository.findById(scoreId)
            .orElseThrow(() -> new RuntimeException("Score not found: " + scoreId));
        return toDto(score);
    }

    public List<ScoreDto> getAllScores() {
        return scoreRepository.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public List<ScoreDto> getAllPublishedScores() {
        return scoreRepository.findByStatus(ScoreStatus.PUBLISHED).stream()
            .sorted((a, b) -> b.getPublishedAt().compareTo(a.getPublishedAt()))
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public ScoreDto getLatestScoreForSubmission(String submissionId) {
        Score score = scoreRepository.findTopBySubmissionIdOrderByCreatedAtDesc(submissionId)
            .orElseThrow(() -> new RuntimeException("No score found for submission: " + submissionId));
        return toDto(score);
    }

    private ScoreDto toDto(Score score) {
        return ScoreDto.builder()
            .id(score.getId())
            .submissionId(score.getSubmissionId())
            .analyticalRigourScore(score.getAnalyticalRigourScore())
            .analyticalRigourFeedback(score.getAnalyticalRigourFeedback())
            .commercialAcumenScore(score.getCommercialAcumenScore())
            .commercialAcumenFeedback(score.getCommercialAcumenFeedback())
            .qualityOfOutputScore(score.getQualityOfOutputScore())
            .qualityOfOutputFeedback(score.getQualityOfOutputFeedback())
            .communicationScore(score.getCommunicationScore())
            .communicationFeedback(score.getCommunicationFeedback())
            .initiativeOwnershipScore(score.getInitiativeOwnershipScore())
            .initiativeOwnershipFeedback(score.getInitiativeOwnershipFeedback())
            .totalScore(score.getTotalScore())
            .tier(score.getTier())
            .status(score.getStatus())
            .createdAt(score.getCreatedAt())
            .updatedAt(score.getUpdatedAt())
            .publishedAt(score.getPublishedAt())
            .build();
    }
}
