import React from 'react';
import { ScoreDto, PILLARS } from '../types';
import { formatDate } from '../utils/date';
import { aggregateScore, TIER_COLOR } from '../utils/scoreAggregation';

interface PublishedViewProps {
  score: ScoreDto;
  onBack: () => void;
  onStartNew?: () => void;
}

const PublishedView: React.FC<PublishedViewProps> = ({ score, onBack, onStartNew }) => {
  const { total, tier } = aggregateScore(score);
  const totalPct = total;
  const gradeColor = TIER_COLOR[tier];

  return (
    <div className="published-view">
      <div className="published-header">
        <div className="published-title-group">
          <span className="published-eyebrow">Score Report</span>
          <h1 className="published-title">TEDxManchester Sponsorship Pitch</h1>
          <p className="published-sub">
            Published {formatDate(score.publishedAt)}
          </p>
        </div>

        <div className="total-score-ring">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10"/>
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={gradeColor}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - totalPct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="55" textAnchor="middle" fill="white" fontSize="26" fontWeight="700">
              {total}
            </text>
            <text x="60" y="73" textAnchor="middle" fill="#94a3b8" fontSize="12">
              /100
            </text>
          </svg>
          <span className="grade-label" style={{ color: gradeColor }}>{tier}</span>
        </div>
      </div>

      <div className="published-pillars">
        {PILLARS.map((pillar) => {
          const s = score[pillar.key] as number;
          const fb = score[pillar.feedbackKey] as string;
          const pct = (s / 20) * 100;
          const barColor = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

          return (
            <div key={pillar.key} className="pub-pillar-row">
              <div className="pub-pillar-top">
                <div>
                  <span className="pub-pillar-label">{pillar.label}</span>
                  <span className="pub-pillar-desc">{pillar.description}</span>
                </div>
                <span className="pub-score-badge" style={{ color: barColor }}>
                  {s}<span className="pub-score-denom">/20</span>
                </span>
              </div>
              <div className="pub-progress-bg">
                <div
                  className="pub-progress-fill"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
              <p className="pub-feedback">{fb}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn-back" onClick={onBack}>
          ← Back to reviewer view
        </button>
        {onStartNew && (
          <button
            className="btn-back"
            style={{ borderColor: 'rgba(99,102,241,0.3)', color: 'var(--accent)' }}
            onClick={onStartNew}
          >
            Score a new submission
          </button>
        )}
      </div>
    </div>
  );
};

export default PublishedView;
