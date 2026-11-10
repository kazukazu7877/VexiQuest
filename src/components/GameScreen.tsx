import React, { useState, useEffect, useRef } from 'react';
import type { Country } from '../data/countries';
import type { Difficulty, AnswerResult } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../types/game';
import { CompassLives } from './CompassLives';
import { FlagCard } from './FlagCard';
import { InfoCard } from './InfoCard';
import { AudioControls } from './AudioControls';
import { Lightbulb, Flame, ArrowRight, ArrowLeft, Compass, X } from './Icons';
import { checkAnswer } from '../utils/answerChecker';
import { soundEngine } from '../utils/soundEngine';

interface GameScreenProps {
  difficulty: Difficulty;
  country: Country;
  questionNumber: number;
  score: number;
  streak: number;
  lives: number;
  hint: string | null;
  hintUsed: boolean;
  onRequestHint: () => void;
  onSubmitAnswer: (result: AnswerResult) => void;
  onNextFlag: () => void;
  onChangeDifficulty: () => void;
  onExitGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  difficulty,
  country,
  questionNumber,
  score,
  streak,
  lives,
  hint,
  hintUsed,
  onRequestHint,
  onSubmitAnswer,
  onNextFlag,
  onChangeDifficulty,
  onExitGame
}) => {
  const [prevCode, setPrevCode] = useState(country.code);
  const [guess, setGuess] = useState('');
  const [revealing, setRevealing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnswerResult | null>(null);
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const transitionTimerRef = useRef<number | null>(null);

  const config = DIFFICULTY_CONFIGS[difficulty];
  const hintsAllowed = config.hintCost !== -1;

  if (prevCode !== country.code) {
    setPrevCode(country.code);
    setGuess('');
    setRevealing(false);
    setCurrentResult(null);
  }

  // Auto focus input on each new question
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    // Support visual testing param (?testDiscovery=correct | ?testDiscovery=incorrect)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const testDisc = params.get('testDiscovery');
      if (testDisc === 'correct') {
        setCurrentResult({
          isCorrect: true,
          userAnswer: country.name,
          country,
          pointsEarned: 20,
          streakBonus: true,
          livesLost: 0
        });
        setRevealing(true);
      } else if (testDisc === 'incorrect') {
        setCurrentResult({
          isCorrect: false,
          userAnswer: 'Atlantis',
          country,
          pointsEarned: 0,
          streakBonus: false,
          livesLost: 1
        });
        setRevealing(true);
      }
    }

    return () => clearTimeout(t);
  }, [country.code, country]);

  // Clean up auto-transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (revealing || !guess.trim()) return;

    soundEngine.playClick();
    const isCorrect = checkAnswer(guess, country);
    const livesLost = isCorrect ? 0 : 1;

    let pointsEarned = 0;
    let isStreakBonus = false;

    if (isCorrect) {
      pointsEarned = config.correctPoints;
      // Hintless bonus (+5 pts in Easy or Medium)
      if (hintsAllowed && !hintUsed) {
        pointsEarned += 5;
      }
      // Streak bonus: +10 pts for every 5 consecutive correct
      if ((streak + 1) % 5 === 0) {
        pointsEarned += 10;
        isStreakBonus = true;
      }
    }

    const result: AnswerResult = {
      isCorrect,
      userAnswer: guess.trim(),
      country,
      pointsEarned,
      streakBonus: isStreakBonus,
      livesLost
    };

    setCurrentResult(result);
    setRevealing(true);

    if (isCorrect) {
      soundEngine.playCorrect();
      if (isStreakBonus) {
        setTimeout(() => soundEngine.playStreakBonus(), 400);
      }
    } else {
      soundEngine.playIncorrect();
    }

    // Submit answer to parent state immediately
    onSubmitAnswer(result);

    // Cancel any previous timer to ensure no duplicate transitions
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    // 5-second country discovery modal
    transitionTimerRef.current = window.setTimeout(() => {
      transitionTimerRef.current = null;
      onNextFlag();
    }, 5000);
  };

  const handleAdvanceManually = () => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    soundEngine.playClick();
    onNextFlag();
  };

  const handleHintClick = () => {
    if (revealing || hintUsed || !hintsAllowed) return;

    if (config.hintCost > 0 && lives <= 1) {
      const confirmed = window.confirm(
        'Warning: You have only 1 life left! Using a clue costs 1 life and will conclude your expedition. Continue?'
      );
      if (!confirmed) return;
    }

    soundEngine.playHint();
    onRequestHint();
  };

  const isGameOver = !revealing ? lives <= 0 : (currentResult ? !currentResult.isCorrect && lives - 1 <= 0 : lives <= 0);

  return (
    <div className="game-screen-wrapper">
      {/* Arcade HUD Header */}
      <header className="game-hud-bar">
        <div className="game-hud-primary-row">
          <div className="hud-group-left game-hud-nav-group">
            <button
              type="button"
              className="hud-menu-btn"
              onClick={() => {
                soundEngine.playClick();
                setIsPauseMenuOpen(true);
              }}
              title="Open Expedition Menu"
            >
              <ArrowLeft size={13} strokeWidth={2.4} />
              <span>MENU</span>
            </button>

            <div className="hud-badge-item hud-flag-index">
              <span className="badge-caption">FLAG</span>
              <span className="badge-digit">#{questionNumber}</span>
            </div>

            <button
              type="button"
              className={`hud-difficulty-tag diff-tag-${difficulty}`}
              onClick={() => {
                soundEngine.playClick();
                onChangeDifficulty();
              }}
              title="Click to Change Difficulty"
            >
              {config.name.toUpperCase()}
            </button>
          </div>

          <div className="hud-group-center game-hud-score-group">
            <div className="hud-badge-item hud-score-box">
              <span className="badge-caption">SCORE</span>
              <span className="badge-digit">{score}</span>
            </div>

            <div className={`hud-badge-item hud-streak-box ${streak >= 3 ? 'streak-active' : ''}`}>
              <span className="badge-caption">
                {streak >= 3 ? <Flame size={12} className="streak-flame-icon" /> : null}
                STREAK
              </span>
              <span className="badge-digit">{streak}</span>
            </div>
          </div>
        </div>

        <div className="hud-group-right game-hud-secondary-row">
          <CompassLives
            currentLives={lives}
            maxLives={config.startingLives}
            showText={true}
          />
          <AudioControls compact />
        </div>
      </header>

      {/* Main Play Area */}
      <main className="game-central-stage">
        {/* Flag Presentation Zone */}
        <div className="flag-presentation-zone">
          <FlagCard country={country} revealed={revealing} />
        </div>

        {/* Interaction Form Zone */}
        <div className="answer-zone">
          <div className="typing-form-card">
            <form onSubmit={handleSubmit} className="country-guess-form" autoComplete="off">
              <div className="input-group-row">
                <div className="terminal-prefix-wrap">
                  <span className="terminal-prompt-char">►</span>
                </div>
                <input
                  ref={inputRef}
                  id="country-guess-input"
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="ENTER NATION NAME..."
                  className="country-text-input"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  disabled={revealing}
                  required
                />

                <button
                  type="submit"
                  className="country-submit-button"
                  disabled={revealing || !guess.trim()}
                  aria-label="Submit Guess"
                >
                  <span>GUESS</span>
                  <ArrowRight size={14} strokeWidth={2.4} />
                </button>
              </div>
            </form>

            {/* Clue Bar */}
            {hintsAllowed && (
              <div className="hint-module-zone">
                {!hintUsed ? (
                  <button
                    type="button"
                    className={`hint-request-button ${config.hintCost > 0 ? 'hint-warn' : 'hint-standard'}`}
                    onClick={handleHintClick}
                    disabled={revealing}
                    title={config.hintCost > 0 ? 'Requesting this clue costs 1 life' : 'Request a free clue'}
                  >
                    <Lightbulb size={13} />
                    <span className="hint-btn-caption">
                      {config.hintCost > 0 ? 'REQUEST CLUE (COSTS 1 LIFE)' : 'REQUEST CLUE (FREE)'}
                    </span>
                  </button>
                ) : (
                  <div className="hint-dispatch-card">
                    <div className="hint-card-title">
                      <Lightbulb size={13} />
                      <span>EXPEDITION CLUE</span>
                    </div>
                    <p className="hint-card-body">{hint}</p>
                  </div>
                )}
              </div>
            )}

            {!hintsAllowed && (
              <div className="hard-mode-indicator">
                <span>HARD MODE — No clues permitted on this expedition.</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Country Fact Experience — Weathered Discovery Card Modal */}
      {revealing && currentResult && (
        <InfoCard
          country={country}
          result={currentResult}
          isGameOver={isGameOver}
          onAdvanceNow={handleAdvanceManually}
        />
      )}

      {/* In-Game Expedition Pause Menu */}
      {isPauseMenuOpen && (
        <div className="retro-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="pause-menu-title">
          <div className="retro-modal-window pause-modal-window">
            <div className="modal-header-bar">
              <div className="modal-title-with-icon">
                <Compass size={18} />
                <h2 id="pause-menu-title" className="modal-title-text">EXPEDITION PAUSED</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  soundEngine.playClick();
                  setIsPauseMenuOpen(false);
                }}
                aria-label="Resume Expedition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content pause-menu-body">
              <p className="modal-description-lead">
                Current difficulty: <strong>{config.name.toUpperCase()}</strong> ({lives} {lives === 1 ? 'life' : 'lives'} remaining, {score} points).
              </p>

              <div className="pause-actions-list">
                <button
                  type="button"
                  className="modal-primary-btn pause-resume-btn"
                  onClick={() => {
                    soundEngine.playClick();
                    setIsPauseMenuOpen(false);
                  }}
                  autoFocus
                >
                  RESUME EXPEDITION
                </button>

                <button
                  type="button"
                  className="pause-secondary-btn pause-diff-btn"
                  onClick={() => {
                    soundEngine.playClick();
                    setIsPauseMenuOpen(false);
                    onChangeDifficulty();
                  }}
                >
                  <Compass size={15} />
                  <span>CHANGE DIFFICULTY</span>
                </button>

                <button
                  type="button"
                  className="pause-secondary-btn pause-exit-btn"
                  onClick={() => {
                    soundEngine.playClick();
                    setIsPauseMenuOpen(false);
                    onExitGame();
                  }}
                >
                  <ArrowLeft size={15} />
                  <span>RETURN TO HOME SCREEN</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
