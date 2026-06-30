package com.scorer.repository;

import com.scorer.model.Score;
import com.scorer.model.ScoreStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    Optional<Score> findTopBySubmissionIdOrderByCreatedAtDesc(String submissionId);
    List<Score> findBySubmissionId(String submissionId);
    List<Score> findByStatus(ScoreStatus status);
}
