package com.scorer.controller;

import com.scorer.dto.GenerateScoreRequest;
import com.scorer.dto.ScoreDto;
import com.scorer.dto.UpdateScoreRequest;
import com.scorer.service.ScoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ScoreController {

    private final ScoreService scoreService;

    /**
     * List all scores (reviewer dashboard)
     */
    @GetMapping
    public ResponseEntity<java.util.List<ScoreDto>> getAllScores() {
        log.info("GET /api/scores");
        return ResponseEntity.ok(scoreService.getAllScores());
    }

    /**
     * List all published scores (public reports index)
     */
    @GetMapping("/published")
    public ResponseEntity<java.util.List<ScoreDto>> getPublishedScores() {
        log.info("GET /api/scores/published");
        return ResponseEntity.ok(scoreService.getAllPublishedScores());
    }

    /**
     * Generate a draft score for a submission using Claude AI
     */
    @PostMapping("/generate")
    public ResponseEntity<ScoreDto> generateScore(@Valid @RequestBody GenerateScoreRequest request) {
        log.info("POST /api/scores/generate for submission: {}", request.getSubmissionId());
        ScoreDto score = scoreService.generateDraftScore(request);
        return ResponseEntity.ok(score);
    }

    /**
     * Get a score by ID
     */
    @GetMapping("/{scoreId}")
    public ResponseEntity<ScoreDto> getScore(@PathVariable Long scoreId) {
        log.info("GET /api/scores/{}", scoreId);
        ScoreDto score = scoreService.getScore(scoreId);
        return ResponseEntity.ok(score);
    }

    /**
     * Get the latest score for a submission
     */
    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<ScoreDto> getScoreBySubmission(@PathVariable String submissionId) {
        log.info("GET /api/scores/submission/{}", submissionId);
        ScoreDto score = scoreService.getLatestScoreForSubmission(submissionId);
        return ResponseEntity.ok(score);
    }

    /**
     * Update pillar scores and feedback (reviewer edits)
     */
    @PutMapping("/{scoreId}")
    public ResponseEntity<ScoreDto> updateScore(
            @PathVariable Long scoreId,
            @Valid @RequestBody UpdateScoreRequest request) {
        log.info("PUT /api/scores/{}", scoreId);
        ScoreDto score = scoreService.updateScore(scoreId, request);
        return ResponseEntity.ok(score);
    }

    /**
     * Publish a score — locks it permanently
     */
    @PostMapping("/{scoreId}/publish")
    public ResponseEntity<ScoreDto> publishScore(@PathVariable Long scoreId) {
        log.info("POST /api/scores/{}/publish", scoreId);
        ScoreDto score = scoreService.publishScore(scoreId);
        return ResponseEntity.ok(score);
    }

    /**
     * Global error handler for state machine violations
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleStateError(IllegalStateException ex) {
        return ResponseEntity.status(409).body(Map.of(
            "error", "LOCKED",
            "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeError(RuntimeException ex) {
        return ResponseEntity.status(404).body(Map.of(
            "error", "NOT_FOUND",
            "message", ex.getMessage()
        ));
    }
}
