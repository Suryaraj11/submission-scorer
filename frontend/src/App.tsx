import React, { useState, useEffect } from 'react';
import ScorerPage from './pages/ScorerPage';
import ReportsPage from './pages/ReportsPage';
import { ScoreDto } from './types';
import { getScore } from './services/api';
import './App.css';

type Page = 'scorer' | 'reports';
type ReviewerView = 'reviewer' | 'published';

const ACTIVE_SCORE_KEY = 'scorer:activeScoreId';

function App() {
  const [page, setPage] = useState<Page>('scorer');

  // The in-progress score (draft/reviewed/published) lives here, not inside
  // ScorerPage, so it survives switching to the Reports tab and back.
  const [activeScore, setActiveScore] = useState<ScoreDto | null>(null);
  const [activeView, setActiveView] = useState<ReviewerView>('reviewer');
  const [restoring, setRestoring] = useState(true);

  // On first load, try to restore whatever score was last in progress
  // (e.g. after a hard page refresh) from sessionStorage + the API.
  useEffect(() => {
    const savedId = sessionStorage.getItem(ACTIVE_SCORE_KEY);
    if (!savedId) {
      setRestoring(false);
      return;
    }
    getScore(Number(savedId))
      .then((score) => setActiveScore(score))
      .catch(() => sessionStorage.removeItem(ACTIVE_SCORE_KEY))
      .finally(() => setRestoring(false));
  }, []);

  // Keep sessionStorage in sync with whichever score is currently active,
  // so a refresh can recover it.
  const handleScoreChange = (score: ScoreDto | null) => {
    setActiveScore(score);
    if (score) {
      sessionStorage.setItem(ACTIVE_SCORE_KEY, String(score.id));
    } else {
      sessionStorage.removeItem(ACTIVE_SCORE_KEY);
    }
  };

  if (restoring) {
    return (
      <div className="app">
        <main className="app-main">
          <div className="loading-state" style={{ margin: '80px auto', maxWidth: 400 }}>
            <div className="loading-dots"><span /><span /><span /></div>
            <p>Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <span className="logo-mark">S</span>
            <span className="logo-text">Scorer</span>
          </div>
          <nav className="app-nav">
            <button
              className={`nav-tab ${page === 'scorer' ? 'active' : ''}`}
              onClick={() => setPage('scorer')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
              </svg>
              Review Submission
            </button>
            <button
              className={`nav-tab ${page === 'reports' ? 'active' : ''}`}
              onClick={() => setPage('reports')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              All Reports
            </button>
          </nav>
        </div>
      </header>
      <main className="app-main">
        {page === 'scorer' ? (
          <ScorerPage
            score={activeScore}
            onScoreChange={handleScoreChange}
            view={activeView}
            onViewChange={setActiveView}
            onGoToReports={() => setPage('reports')}
          />
        ) : (
          <ReportsPage
            onScoreUpdated={(updated) => {
              if (activeScore && activeScore.id === updated.id) {
                handleScoreChange(updated);
              }
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;