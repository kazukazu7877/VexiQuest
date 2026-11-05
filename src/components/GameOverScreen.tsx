import React, { useEffect } from 'react';
import type { Difficulty, PersonalBests } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../types/game';
import { AudioControls } from './AudioControls';
import { Trophy, RotateCcw, Compass, ArrowLeft } from './Icons';
import { soundEngine } from '../utils/soundEngine';

interface GameOverScreenProps {
  difficulty: Difficulty;
  finalScore: number;
  totalAttempted: number;
  totalCorrect: number;
  highestStreak: number;
  personalBests: PersonalBests;
  isNewHighScore: boolean;
  isNewBestStreak: boolean;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  difficulty,
  finalScore,
  totalAttempted,
  totalCorrect,
  highestStreak,
  personalBests,
  isNewHighScore,
  isNewBestStreak,
  onPlayAgain,
  onReturnHome
}) => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const pb = personalBests[difficulty] || { highScore: finalScore, bestStreak: highestStreak };

  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  useEffect(() => {
    soundEngine.playGameOver();
  }, []);

  return (
    <div className="game-over-container">
      {/* Top Header */}
      <header className="game-over-header">
        <button
          type="button"
          className="back-to-home-link"
          onClick={onReturnHome}
        >
          <ArrowLeft size={13} strokeWidth={2.4} />
          <span>MENU</span>
        </button>
        <AudioControls />
      </header>

      {/* Main Results Board */}
      <main className="game-over-stage">
        <div className="game-over-emblem">
          <Compass size={32} className="game-over-compass-icon" strokeWidth={1.6} />
        </div>

        <div className="game-over-title-group">
          <h1 className="game-over-main-title">GAME OVER</h1>
          <p className="game-over-subheading">
            YOUR {config.name.toUpperCase()} EXPEDITION HAS CONCLUDED
          </p>
        </div>

        {/* Results Arcade Board */}
        <div className="results-arcade-card">
          <div className="final-score-feature">
            <span className="score-feature-label">FINAL SCORE</span>
            <span className="score-feature-number">{finalScore}</span>
            {isNewHighScore && (
              <div className="new-high-score-banner">
                <Trophy size={13} />
                <span>NEW EXPEDITION RECORD!</span>
              </div>
            )}
          </div>

          {/* 4 Stats Grid */}
          <div className="expedition-stats-grid">
            <div className="stat-card-item">
              <span className="stat-card-label">FLAGS ATTEMPTED</span>
              <span className="stat-card-digit">{totalAttempted}</span>
            </div>

            <div className="stat-card-item">
              <span className="stat-card-label">CORRECT GUESSES</span>
              <span className="stat-card-digit stat-success">{totalCorrect}</span>
            </div>

            <div className="stat-card-item">
              <span className="stat-card-label">ACCURACY</span>
              <span className="stat-card-digit">{accuracy}%</span>
            </div>

            <div className="stat-card-item">
              <span className="stat-card-label">BEST STREAK</span>
              <span className="stat-card-digit stat-amber">
                {highestStreak} {isNewBestStreak && '★'}
              </span>
            </div>
          </div>

          {/* Record Comparison */}
          <div className="pb-benchmark-row">
            <span className="benchmark-title">{config.name.toUpperCase()} BENCHMARK:</span>
            <span className="benchmark-value">
              HIGH SCORE: <strong>{pb.highScore} PTS</strong> • BEST STREAK: <strong>{pb.bestStreak}</strong>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="game-over-action-row">
          <button
            type="button"
            className="replay-primary-btn"
            onClick={() => {
              soundEngine.playClick();
              onPlayAgain();
            }}
            autoFocus
          >
            <RotateCcw size={15} />
            <span>PLAY AGAIN</span>
          </button>

          <button
            type="button"
            className="change-difficulty-secondary-btn"
            onClick={() => {
              soundEngine.playClick();
              onReturnHome();
            }}
          >
            <Compass size={15} />
            <span>CHANGE DIFFICULTY</span>
          </button>
        </div>
      </main>
    </div>
  );
};
