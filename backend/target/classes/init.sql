-- Database: submission_scorer
-- Run this to initialize the database

CREATE TABLE IF NOT EXISTS scores (
    id BIGSERIAL PRIMARY KEY,
    submission_id VARCHAR(255) NOT NULL,

    analytical_rigour_score INTEGER CHECK (analytical_rigour_score >= 0 AND analytical_rigour_score <= 20),
    analytical_rigour_feedback TEXT,

    commercial_acumen_score INTEGER CHECK (commercial_acumen_score >= 0 AND commercial_acumen_score <= 20),
    commercial_acumen_feedback TEXT,

    quality_of_output_score INTEGER CHECK (quality_of_output_score >= 0 AND quality_of_output_score <= 20),
    quality_of_output_feedback TEXT,

    communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 20),
    communication_feedback TEXT,

    initiative_ownership_score INTEGER CHECK (initiative_ownership_score >= 0 AND initiative_ownership_score <= 20),
    initiative_ownership_feedback TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEWED', 'PUBLISHED')),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    published_at TIMESTAMP
);

CREATE INDEX idx_scores_submission_id ON scores(submission_id);
CREATE INDEX idx_scores_status ON scores(status);
