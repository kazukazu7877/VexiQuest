import React, { useEffect } from 'react';
import type { Country } from '../data/countries';
import type { AnswerResult } from '../types/game';
import { MapPin, Globe, BookOpen, ArrowRight, Check, X } from './Icons';

interface InfoCardProps {
  country: Country;
  result: AnswerResult;
  isGameOver: boolean;
  onAdvanceNow: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  country,
  result,
  isGameOver,
  onAdvanceNow
}) => {
  const isCorrect = result.isCorrect;
  const fact = country.facts[0] || (country.hints && country.hints[0]) || '';

  // Keyboard shortcut: Space, Enter, or Escape advances immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        onAdvanceNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAdvanceNow]);

  return (
    <div
      className="country-dispatch-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onAdvanceNow();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Country Expedition Dispatch"
    >
      <div className="country-dispatch-modal-dialog">
        {/* Weathered Parchment Discovery Card */}
        <div
          className={`discovery-parchment-card ${isCorrect ? 'modal-correct' : 'modal-incorrect'}`}
        >
          {/* Outcome Header Banner */}
          <div className="modal-outcome-header">
            <div className="modal-outcome-title">
              <span className="modal-outcome-icon" aria-hidden="true">
                {isCorrect ? <Check size={14} strokeWidth={2.8} /> : <X size={14} strokeWidth={2.8} />}
              </span>
              <h2 className="modal-headline">
                {isCorrect ? 'CORRECT!' : 'INCORRECT!'}
              </h2>
            </div>

            <div className="modal-badges-group">
              {isCorrect && (
                <span className="badge-pts-pill">+{result.pointsEarned} PTS</span>
              )}
              {result.streakBonus && (
                <span className="badge-bonus-pill">+10 STREAK BONUS</span>
              )}
            </div>
          </div>

          {/* Country Name Banner */}
          <div className="modal-country-banner">
            <span className="modal-country-pretext">NATION ARCHIVE</span>
            <div className="modal-country-title-row">
              <div className="modal-country-flag-thumb">
                <img
                  src={`/flags/${country.code.toLowerCase()}.svg`}
                  alt=""
                  aria-hidden="true"
                  className="modal-thumb-flag-img"
                />
              </div>
              <h3 className="modal-country-name">{country.name}</h3>
            </div>
          </div>

          {/* Geographic Metadata Pillars */}
          <div className="modal-meta-row">
            <div className="modal-meta-pill">
              <span className="meta-sub">
                <MapPin size={11} /> CAPITAL
              </span>
              <span className="meta-main">{country.capital}</span>
            </div>

            <div className="modal-meta-sep" aria-hidden="true">•</div>

            <div className="modal-meta-pill">
              <span className="meta-sub">
                <Globe size={11} /> CONTINENT
              </span>
              <span className="meta-main">{country.continent}</span>
            </div>
          </div>

          {/* Interesting Fact Entry */}
          {fact && (
            <div className="modal-fact-entry">
              <div className="fact-label-row">
                <BookOpen size={11} />
                <span>EXPEDITION ARCHIVE NOTE</span>
              </div>
              <p className="fact-quote">“{fact}”</p>
            </div>
          )}

          {/* 5-Second Countdown Progress Bar */}
          <div className="modal-timer-track">
            <div className="modal-timer-fill" />
          </div>
        </div>

        {/* Action Button: Next Flag or View Results */}
        <div className="modal-action-row">
          <button
            type="button"
            className="modal-next-btn"
            onClick={onAdvanceNow}
            autoFocus
          >
            <span>{isGameOver ? 'VIEW RESULTS' : 'NEXT FLAG'}</span>
            <ArrowRight size={14} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
};
