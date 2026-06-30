import React, { useState } from 'react';
import { PillarData, ScoreDto, ScoreStatus } from '../types';

interface PillarCardProps {
  pillar: PillarData;
  score: number;
  feedback: string;
  status: ScoreStatus;
  onUpdate: (scoreKey: keyof ScoreDto, feedbackKey: keyof ScoreDto, score: number, feedback: string) => void;
}

const PillarCard: React.FC<PillarCardProps> = ({
  pillar,
  score,
  feedback,
  status,
  onUpdate,
}) => {
  const [editScore, setEditScore] = useState(score);
  const [editFeedback, setEditFeedback] = useState(feedback);
  const [isDirty, setIsDirty] = useState(false);

  const isLocked = status === 'PUBLISHED';

  const handleScoreChange = (val: number) => {
    if (isLocked) return;
    const clamped = Math.max(0, Math.min(20, val));
    setEditScore(clamped);
    setIsDirty(true);
  };

  const handleFeedbackChange = (val: string) => {
    if (isLocked) return;
    setEditFeedback(val);
    setIsDirty(true);
  };

  const handleSave = () => {
    onUpdate(pillar.key, pillar.feedbackKey, editScore, editFeedback);
    setIsDirty(false);
  };

  const pct = (editScore / 20) * 100;
  const barColor =
    pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="pillar-card" style={{ opacity: isLocked ? 0.85 : 1 }}>
      <div className="pillar-header">
        <div>
          <h3 className="pillar-label">{pillar.label}</h3>
          <p className="pillar-desc">{pillar.description}</p>
        </div>
        <div className="score-badge">
          {isLocked ? (
            <span className="score-value">{editScore}</span>
          ) : (
            <input
              type="number"
              className="score-input"
              value={editScore}
              min={0}
              max={20}
              onChange={(e) => handleScoreChange(Number(e.target.value))}
              disabled={isLocked}
            />
          )}
          <span className="score-denom">/20</span>
        </div>
      </div>

      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      <div className="feedback-section">
        {isLocked ? (
          <p className="feedback-text">{editFeedback}</p>
        ) : (
          <textarea
            className="feedback-textarea"
            value={editFeedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            rows={3}
            placeholder="Edit feedback..."
            disabled={isLocked}
          />
        )}
      </div>

      {!isLocked && isDirty && (
        <div className="pillar-actions">
          <button className="btn-save-pillar" onClick={handleSave}>
            Save changes
          </button>
          <button
            className="btn-cancel-pillar"
            onClick={() => {
              setEditScore(score);
              setEditFeedback(feedback);
              setIsDirty(false);
            }}
          >
            Discard
          </button>
        </div>
      )}

      {isLocked && (
        <div className="locked-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
          Locked
        </div>
      )}
    </div>
  );
};

export default PillarCard;
