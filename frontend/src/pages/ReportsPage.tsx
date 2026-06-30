import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllScores,
  getPublishedScores,
  getScore,
  updateScore,
  publishScore,
  extractErrorMessage,
  isLockedError,
} from '../services/api';
import { ScoreDto, ScoreStatus, PILLARS } from '../types';
import PublishedView from '../components/PublishedView';
import PillarCard from '../components/PillarCard';
import { formatDate, formatDateTime, parseDate } from '../utils/date';
import { calculateTotal } from '../utils/scoreAggregation';

type FilterMode = 'all' | 'published' | 'draft' | 'reviewed';

const STATUS_LABEL: Record<ScoreStatus, string> = {
  DRAFT: 'Draft',
  REVIEWED: 'Reviewed',
  PUBLISHED: 'Published',
};

interface ReportsPageProps {
  /** Called whenever a score is edited or published from within this page,
   *  so App can keep its activeScore in sync if it's the same record. */
  onScoreUpdated?: (score: ScoreDto) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onScoreUpdated }) => {
  const [scores, setScores] = useState<ScoreDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selected, setSelected] = useState<ScoreDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lockedError, setLockedError] = useState(false);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = filter === 'published'
        ? await getPublishedScores()
        : await getAllScores();
      setScores(data);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchScores(); }, [fetchScores]);

  const handleOpen = async (scoreId: number) => {
    setLoadingDetail(true);
    setError(null);
    try {
      const detail = await getScore(scoreId);
      setSelected(detail);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleClose = () => {
    setSelected(null);
    setLockedError(false);
    // Re-fetch the list so any status change made in the detail view
    // (e.g. draft -> reviewed -> published) is reflected immediately.
    fetchScores();
  };

  const handlePillarUpdate = useCallback(
    async (
      scoreKey: keyof ScoreDto,
      feedbackKey: keyof ScoreDto,
      newScore: number,
      newFeedback: string
    ) => {
      if (!selected) return;
      setError(null);
      setLockedError(false);
      try {
        const updated = await updateScore(selected.id, {
          [scoreKey]: newScore,
          [feedbackKey]: newFeedback,
        });
        setSelected(updated);
        onScoreUpdated?.(updated);
      } catch (e) {
        if (isLockedError(e)) {
          setLockedError(true);
        } else {
          setError(extractErrorMessage(e));
        }
      }
    },
    [selected]
  );

  const handlePublish = async () => {
    if (!selected) return;
    setPublishing(true);
    setError(null);
    setLockedError(false);
    try {
      const published = await publishScore(selected.id);
      setSelected(published);
      onScoreUpdated?.(published);
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

  const filtered = scores.filter((s) => {
    if (filter === 'all' || filter === 'published') return true;
    return s.status === filter.toUpperCase();
  });

  const counts = {
    all: scores.length,
    published: scores.filter((s) => s.status === 'PUBLISHED').length,
    reviewed: scores.filter((s) => s.status === 'REVIEWED').length,
    draft: scores.filter((s) => s.status === 'DRAFT').length,
  };

  if (selected) {
    if (selected.status === 'PUBLISHED') {
      return <PublishedView score={selected} onBack={handleClose} />;
    }
    // Non-published detail view (draft / reviewed) — editable, with publish
    return (
      <div className="reports-detail-view">
        <button className="btn-back" onClick={handleClose}>
          ← Back to reports
        </button>
        <div className="detail-header">
          <div className={`status-pill status-${selected.status.toLowerCase()}`}>
            {STATUS_LABEL[selected.status]}
          </div>
          <h2 className="detail-title">Score #{selected.id}</h2>
          <p className="detail-sub">Submission: {selected.submissionId}</p>
          <p className="detail-meta">
            Created {formatDateTime(selected.createdAt)}
            {parseDate(selected.updatedAt)?.getTime() !== parseDate(selected.createdAt)?.getTime() &&
              ` · Updated ${formatDateTime(selected.updatedAt)}`}
          </p>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: 16 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {lockedError && (
          <div className="locked-banner" style={{ marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            This score is published and locked. No further edits are allowed.
          </div>
        )}

        <div className="detail-total-row">
          <span className="detail-total-label">Total score</span>
          <span className="detail-total-value">{selected.totalScore}</span>
          <span className="detail-total-max">/100</span>
        </div>

        <div className="pillars-grid" style={{ marginBottom: 20 }}>
          {PILLARS.map((pillar) => (
            <PillarCard
              key={pillar.key}
              pillar={pillar}
              score={selected[pillar.key] as number}
              feedback={selected[pillar.feedbackKey] as string}
              status={selected.status}
              onUpdate={handlePillarUpdate}
            />
          ))}
        </div>

        <div className="publish-bar">
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
          <span className="publish-notice">
            Editing pillar scores moves this from Draft to Reviewed. Publishing locks it permanently.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Score Reports</h1>
          <p className="reports-sub">All submissions — click any row to view the full report</p>
        </div>
        <button className="btn-refresh" onClick={fetchScores} disabled={loading}>
          {loading ? <span className="spinner" /> : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          )}
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {(['all', 'published', 'reviewed', 'draft'] as FilterMode[]).map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : STATUS_LABEL[f.toUpperCase() as ScoreStatus]}
            <span className="tab-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="reports-loading">
          <div className="loading-dots"><span /><span /><span /></div>
          <p>Loading reports…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="reports-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.25">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <p>No {filter !== 'all' ? STATUS_LABEL[filter.toUpperCase() as ScoreStatus].toLowerCase() + ' ' : ''}reports found</p>
          {filter !== 'all' && (
            <button className="btn-cancel-pillar" style={{ marginTop: 12 }} onClick={() => setFilter('all')}>
              Show all
            </button>
          )}
        </div>
      ) : (
        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Submission</th>
                <th>Status</th>
                <th>Total</th>
                <th>Analytical</th>
                <th>Commercial</th>
                <th>Quality</th>
                <th>Communication</th>
                <th>Initiative</th>
                <th>Created</th>
                <th>Published</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="report-row" onClick={() => handleOpen(s.id)}>
                  <td className="td-id">#{s.id}</td>
                  <td className="td-submission">{s.submissionId}</td>
                  <td>
                    <span className={`status-pill status-${s.status.toLowerCase()}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                  <td className="td-total">
                    {(() => {
                      const total = s.totalScore ?? calculateTotal(s);
                      return (
                        <span className="total-chip"
                          style={{ color: total >= 75 ? '#22c55e' : total >= 50 ? '#f59e0b' : '#ef4444' }}>
                          {total}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
                        </span>
                      );
                    })()}
                  </td>
                  {[s.analyticalRigourScore, s.commercialAcumenScore, s.qualityOfOutputScore, s.communicationScore, s.initiativeOwnershipScore].map((sc, i) => (
                    <td key={i} className="td-pillar">
                      <PillarMiniBar score={sc} />
                    </td>
                  ))}
                  <td className="td-date">{formatDate(s.createdAt)}</td>
                  <td className="td-date">
                    {s.publishedAt ? formatDate(s.publishedAt) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    <span className="row-open-btn">
                      {loadingDetail ? '…' : 'View →'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const PillarMiniBar: React.FC<{ score: number }> = ({ score }) => {
  const pct = (score / 20) * 100;
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="mini-bar-wrap">
      <div className="mini-bar-bg">
        <div className="mini-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="mini-bar-label" style={{ color }}>{score}</span>
    </div>
  );
};

export default ReportsPage;