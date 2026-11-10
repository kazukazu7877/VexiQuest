import React, { useState } from 'react';
import type { FlagRushResult, FlagRushPersonalBest } from '../types/game';
import { Trophy, Home, Copy, ChevronDown, ChevronUp, Check, Zap } from './Icons';
import { soundEngine } from '../utils/soundEngine';

interface FlagRushResultsProps {
  result: FlagRushResult;
  personalBest: FlagRushPersonalBest;
  isNewRecord: boolean;
  onReturnHome: () => void;
}

export const FlagRushResults: React.FC<FlagRushResultsProps> = ({
  result,
  personalBest,
  isNewRecord,
  onReturnHome,
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);

  // Generate shareable formatted text
  const shareText = [
    `🏁 VexiQuest — Flag Rush`,
    ``,
    `I guessed ${result.score} country flags in 60 seconds!`,
    ``,
    `Correct answers: ${result.totalCorrect}`,
    `Incorrect answers: ${result.totalIncorrect}`,
    `Accuracy: ${result.accuracy}%`,
    `Longest streak: ${result.longestStreak}`,
    ``,
    `Think you can beat my score?`,
    ``,
    `Play VexiQuest:`,
    `https://vexiquest.vercel.app`
  ].join('\n');

  // Copy with fallback
  const handleCopyResult = async () => {
    soundEngine.playClick();
    let copied = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareText);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      // Fallback using temporary textarea
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      soundEngine.playCopySuccess();
      setCopySuccess(true);
    } else {
      window.prompt('Copy your Flag Rush score:', shareText);
    }
  };

  const handleHomeClick = () => {
    soundEngine.playClick();
    onReturnHome();
  };

  return (
    <div className="rush-results-container" role="dialog" aria-modal="true" aria-labelledby="rush-results-title">
      <div className="rush-results-card">
        {/* Header */}
        <header className="rush-results-header">
          <div className="rush-results-tag">
            <Zap size={14} />
            <span>SPEEDRUN CHALLENGE</span>
          </div>
          <h1 id="rush-results-title" className="rush-results-title">TIME&apos;S UP!</h1>
          {isNewRecord && (
            <div className="rush-new-record-pill">
              <Trophy size={14} />
              <span>★ NEW PERSONAL RECORD! ★</span>
            </div>
          )}
        </header>

        {/* Hero Score Showcase */}
        <div className="rush-hero-score-box">
          <span className="rush-score-digits">{result.score}</span>
          <span className="rush-score-unit">FLAGS</span>
        </div>

        {/* Dynamic Post-Copy Friendly Confirmation Banner */}
        {copySuccess && (
          <div className="rush-copy-banner" role="status">
            <div className="copy-banner-heading">
              <Check size={16} />
              <span>RESULT COPIED!</span>
            </div>
            <p className="copy-banner-text">
              Your score is ready to share! Paste it into a chat, post or story and challenge your friends to beat your record.
            </p>
          </div>
        )}

        {/* Detailed Stats Grid */}
        <div className="rush-metrics-grid">
          <div className="metric-cell">
            <span className="metric-label">CORRECT</span>
            <span className="metric-value value-correct">{result.totalCorrect}</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">INCORRECT</span>
            <span className="metric-value value-incorrect">{result.totalIncorrect}</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">ACCURACY</span>
            <span className="metric-value">{result.accuracy}%</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">LONGEST STREAK</span>
            <span className="metric-value">{result.longestStreak}🔥</span>
          </div>
          <div className="metric-cell metric-cell-full">
            <span className="metric-label">ALL-TIME BEST</span>
            <span className="metric-value value-gold">
              <Trophy size={13} /> {Math.max(personalBest.highScore, result.score)} FLAGS
            </span>
          </div>
        </div>

        {/* Collapsible Run Review Section (Not a primary button) */}
        <div className="rush-review-accordion">
          <button
            type="button"
            className="review-toggle-btn"
            onClick={() => setIsReviewOpen(!isReviewOpen)}
            aria-expanded={isReviewOpen}
          >
            <span>RUN REVIEW ({result.history.length + (result.unansweredCountry ? 1 : 0)} FLAGS)</span>
            {isReviewOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isReviewOpen && (
            <div className="review-list-tray">
              {result.history.map((item, idx) => (
                <div key={idx} className={`review-item-row ${item.isCorrect ? 'row-correct' : 'row-incorrect'}`}>
                  <span className="review-index">#{idx + 1}</span>
                  <img
                    src={`/flags/${item.country.code.toLowerCase()}.svg`}
                    alt=""
                    className="review-flag-thumb"
                  />
                  <div className="review-details">
                    <span className="review-country-name">{item.country.name}</span>
                    {!item.isCorrect && (
                      <span className="review-guess-text">Guessed: &ldquo;{item.userAnswer}&rdquo;</span>
                    )}
                  </div>
                  <div className="review-badge-wrap">
                    {item.hintUsed && <span className="review-hint-tag">HINT</span>}
                    <span className={`review-status-tag ${item.isCorrect ? 'tag-correct' : 'tag-wrong'}`}>
                      {item.isCorrect ? '✓ CORRECT' : '✕ WRONG'}
                    </span>
                  </div>
                </div>
              ))}

              {result.unansweredCountry && (
                <div className="review-item-row row-unanswered">
                  <span className="review-index">#{result.history.length + 1}</span>
                  <img
                    src={`/flags/${result.unansweredCountry.code.toLowerCase()}.svg`}
                    alt=""
                    className="review-flag-thumb"
                  />
                  <div className="review-details">
                    <span className="review-country-name">{result.unansweredCountry.name}</span>
                    <span className="review-guess-text">Time ran out during this flag</span>
                  </div>
                  <div className="review-badge-wrap">
                    <span className="review-status-tag tag-unanswered">⏱ UNANSWERED</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* EXACTLY TWO PRIMARY BUTTONS */}
        <div className="rush-primary-actions-row">
          {/* BUTTON ONE */}
          <button
            type="button"
            className="rush-action-btn btn-home-screen"
            onClick={handleHomeClick}
          >
            <Home size={16} />
            <span>HOME SCREEN</span>
          </button>

          {/* BUTTON TWO */}
          <button
            type="button"
            className="rush-action-btn btn-copy-result"
            onClick={handleCopyResult}
            autoFocus
          >
            <Copy size={16} />
            <span>{copySuccess ? 'COPY RESULT AGAIN' : 'COPY MY RESULT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

