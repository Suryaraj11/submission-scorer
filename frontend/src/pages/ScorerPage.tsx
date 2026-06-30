import React, { useCallback } from 'react';
import {
  generateScore,
  updateScore,
  publishScore,
  extractErrorMessage,
  isLockedError,
} from '../services/api';
import { ScoreDto, PILLARS } from '../types';
import PillarCard from '../components/PillarCard';
import PublishedView from '../components/PublishedView';
import { formatDateTime } from '../utils/date';

const SUBMISSION_ID = 'tedx-manchester-001';
const SUBMISSION_TEXT =
  'I went deep on the audience side first. The TEDxManchester ticket data shows 62 percent of attendees are 28 to 42, professional, design conscious. I built a single master deck that leans into that. Then I tailored three versions, one for Marks and Spencer, one for Lululemon, one for Ace Hotel. The pricing tiers are 5k, 15k, 35k. I decided against programmatic banner ads because the audience hates them.';

type ReviewerView = 'reviewer' | 'published';

interface ScorerPageProps {
  /** Active in-progress score, lifted up to App so it survives navigation between tabs. */
  score: ScoreDto | null;
  onScoreChange: (score: ScoreDto | null) => void;
  view: ReviewerView;
  onViewChange: (view: ReviewerView) => void;
  onGoToReports?: () => void;
}

const ScorerPage: React.FC<ScorerPageProps> = ({
  score,
  onScoreChange,
  view,
  onViewChange,
  onGoToReports,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lockedError, setLockedError] = React.useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setLockedError(false);
    try {
      const result = await generateScore(SUBMISSION_ID, SUBMISSION_TEXT);
      onScoreChange(result);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handlePillarUpdate = useCallback(
    async (
      scoreKey: keyof ScoreDto,
      feedbackKey: keyof ScoreDto,
      newScore: number,
      newFeedback: string
    ) => {
      if (!score) return;
      setError(null);
      setLockedError(false);
      try {
        const updated = await updateScore(score.id, {
          [scoreKey]: newScore,
          [feedbackKey]: newFeedback,
        });
        onScoreChange(updated);
      } catch (e) {
        if (isLockedError(e)) {
          setLockedError(true);
        } else {
          setError(extractErrorMessage(e));
        }
      }
    },
    [score, onScoreChange]
  );

  const handlePublish = async () => {
    if (!score) return;
    setPublishing(true);
    setError(null);
    setLockedError(false);
    try {
      const published = await publishScore(score.id);
      onScoreChange(published);
    } catch (e) {
      if (isLockedError(e)) {
        setLockedError(true);
      } else {
        setError(extractErrorMessage(e));
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleStartNew = () => {
    onScoreChange(null);
    onViewChange('reviewer');
    setError(null);
    setLockedError(false);
  };

  const statusLabel: Record<string, string> = {
    DRAFT: 'Draft',
    REVIEWED: 'Reviewed',
    PUBLISHED: 'Published',
  };

  if (view === 'published' && score?.status === 'PUBLISHED') {
    return (
      <PublishedView
        score={score}
        onBack={() => onViewChange('reviewer')}
        onStartNew={handleStartNew}
      />
    );
  }

  return (
    <div className="scorer-page">
      {/* Submission Panel */}
      <div className="submission-panel">
        <div className="submission-panel-inner">
          <div className="submission-eyebrow">Candidate Submission</div>
          <h2 className="submission-title">TEDxManchester Sponsorship Pitch</h2>
          <p className="submission-id-label">ID: {SUBMISSION_ID}</p>
          <blockquote className="submission-text">{SUBMISSION_TEXT}</blockquote>

          {!score && (
            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <span className="btn-inner">
                  <span className="spinner" />
                  Generating with Claude…
                </span>
              ) : (
                <span className="btn-inner">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                  Generate draft score
                </span>
              )}
            </button>
          )}

          {score && (
            <div className="submission-score-summary">
              <div className={`status-pill status-${score.status.toLowerCase()}`}>
                {statusLabel[score.status]}
              </div>
              <div className="total-summary">
                <span className="total-label">Total</span>
                <span className="total-value">{score.totalScore}</span>
                <span className="total-max">/100</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scorer Panel */}
      <div className="scorer-panel">
        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        {lockedError && (
          <div className="locked-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            This score is published and locked. No further edits are allowed.
          </div>
        )}

        {!score && !loading && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <p className="empty-text">Generate a draft score to begin reviewing</p>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-dots">
              <span /><span /><span />
            </div>
            <p>Claude is analysing the submission…</p>
          </div>
        )}

        {score && (
          <>
            <div className="pillars-grid">
              {PILLARS.map((pillar) => (
                <PillarCard
                  key={pillar.key}
                  pillar={pillar}
                  score={score[pillar.key] as number}
                  feedback={score[pillar.feedbackKey] as string}
                  status={score.status}
                  onUpdate={handlePillarUpdate}
                />
              ))}
            </div>

            <div className="publish-bar">
              {score.status !== 'PUBLISHED' ? (
                <button
                  className="btn-publish"
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {publishing ? (
                    <span className="btn-inner">
                      <span className="spinner spinner-dark" />
                      Publishing…
                    </span>
                  ) : (
                    'Publish score'
                  )}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    className="btn-view-published"
                    onClick={() => onViewChange('published')}
                  >
                    View published report →
                  </button>
                  {onGoToReports && (
                    <button
                      className="btn-view-published"
                      style={{ borderColor: 'rgba(99,102,241,0.3)', color: 'var(--accent)', background: 'rgba(99,102,241,0.08)' }}
                      onClick={onGoToReports}
                    >
                      All reports →
                    </button>
                  )}
                  <button
                    className="btn-view-published"
                    style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)', background: 'transparent' }}
                    onClick={handleStartNew}
                  >
                    Score a new submission
                  </button>
                </div>
              )}

              {score.status === 'PUBLISHED' && (
                <span className="publish-notice">
                  Published {formatDateTime(score.publishedAt)}. Score is locked.
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScorerPage;

