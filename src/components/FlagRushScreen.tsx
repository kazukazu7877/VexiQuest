import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Country } from '../data/countries';
import type { FlagRushResult, FlagRushQuestionResult } from '../types/game';
import { FlagRushPoolManager } from '../utils/gamePool';
import { checkAnswer } from '../utils/answerChecker';
import { soundEngine } from '../utils/soundEngine';
import { AudioControls } from './AudioControls';
import { Zap, ArrowRight, HelpCircle } from './Icons';
import flagRatiosData from '../data/flagRatios.json';

const flagRatios = flagRatiosData as Record<string, number>;

interface FlagRushScreenProps {
  onFinish: (result: FlagRushResult) => void;
  onExit: () => void;
}

const TOTAL_DURATION_MS = 60000; // 60 seconds

export const FlagRushScreen: React.FC<FlagRushScreenProps> = ({ onFinish, onExit }) => {
  const poolRef = useRef<FlagRushPoolManager>(new FlagRushPoolManager());

  // Game metrics
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [totalAttempted, setTotalAttempted] = useState<number>(0);
  const [totalIncorrect, setTotalIncorrect] = useState<number>(0);

  // Hint state
  const [hint, setHint] = useState<string | null>(null);
  const [hintUsedOnCurrent, setHintUsedOnCurrent] = useState<boolean>(false);

  // Feedback state
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [lastUserGuess, setLastUserGuess] = useState<string>('');

  // Input state
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Run history
  const historyRef = useRef<FlagRushQuestionResult[]>([]);
  const finishedRef = useRef<boolean>(false);

  // Absolute monotonic timing
  const deadlineRef = useRef<number>(performance.now() + TOTAL_DURATION_MS);
  const [remainingMs, setRemainingMs] = useState<number>(TOTAL_DURATION_MS);
  const lastSecondRef = useRef<number>(60);
  const intenseMusicTriggeredRef = useRef<boolean>(false);

  // Transition timeout ref to cancel if timer expires
  const feedbackTimeoutRef = useRef<number | null>(null);

  // Setup first flag and music on mount
  useEffect(() => {
    poolRef.current.reset();
    const first = poolRef.current.getNextCountry();
    setCurrentCountry(first);
    deadlineRef.current = performance.now() + TOTAL_DURATION_MS;
    soundEngine.playTrack('flagrush');

    return () => {
      if (feedbackTimeoutRef.current !== null) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Complete run callback
  const completeRun = useCallback(
    (unanswered: Country | null = null) => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      if (feedbackTimeoutRef.current !== null) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }

      soundEngine.playTimesUp();
      soundEngine.pauseMusic();

      const totalCorrect = score;
      const totalSubmitted = totalCorrect + totalIncorrect;
      const accuracy = totalSubmitted > 0 ? (totalCorrect / totalSubmitted) * 100 : 0;

      const finalResult: FlagRushResult = {
        score: totalCorrect,
        totalAttempted: totalAttempted,
        totalCorrect: totalCorrect,
        totalIncorrect: totalIncorrect,
        accuracy: Math.round(accuracy * 10) / 10,
        longestStreak: Math.max(longestStreak, streak),
        unansweredCountry: unanswered,
        history: historyRef.current,
      };

      onFinish(finalResult);
    },
    [score, totalIncorrect, totalAttempted, longestStreak, streak, onFinish]
  );

  // Main high-precision animation loop for timer
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (finishedRef.current) return;

      const now = performance.now();
      const diff = Math.max(0, deadlineRef.current - now);
      setRemainingMs(diff);

      const sec = Math.ceil(diff / 1000);

      // Trigger intense music in final 15 seconds
      if (diff <= 15000 && !intenseMusicTriggeredRef.current) {
        intenseMusicTriggeredRef.current = true;
        soundEngine.playTrack('flagrush-intense');
      }

      // Subtle audio tick in final 5 seconds
      if (sec <= 5 && sec > 0 && sec !== lastSecondRef.current) {
        lastSecondRef.current = sec;
        soundEngine.playCountdownBeep(false);
      }

      if (diff <= 0) {
        completeRun(feedback === 'none' ? currentCountry : null);
        return;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [completeRun, feedback, currentCountry]);

  // Focus input automatically
  useEffect(() => {
    if (feedback === 'none' && !finishedRef.current) {
      inputRef.current?.focus();
    }
  }, [feedback, currentCountry]);

  // Advance to next flag
  const loadNextFlag = useCallback(() => {
    if (finishedRef.current) return;

    const next = poolRef.current.getNextCountry();
    if (!next) {
      // All 195 countries completed in 60s!
      completeRun(null);
      return;
    }

    setCurrentCountry(next);
    setFeedback('none');
    setInputValue('');
    setHint(null);
    setHintUsedOnCurrent(false);
  }, [completeRun]);

  // Submit Answer
  const handleGuessSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentCountry || feedback !== 'none' || finishedRef.current) return;

    const cleanInput = inputValue.trim();
    if (!cleanInput) return;

    const isCorrect = checkAnswer(cleanInput, currentCountry);
    setTotalAttempted((prev) => prev + 1);
    setLastUserGuess(cleanInput);

    // Record question history
    historyRef.current.push({
      country: currentCountry,
      userAnswer: cleanInput,
      isCorrect,
      hintUsed: hintUsedOnCurrent,
      timestamp: Date.now(),
    });

    if (isCorrect) {
      const nextScore = score + 1;
      const nextStreak = streak + 1;
      setScore(nextScore);
      setStreak(nextStreak);
      setLongestStreak((prev) => Math.max(prev, nextStreak));
      setFeedback('correct');
      soundEngine.playRushCorrect();

      // Rapid auto-advance (~380ms)
      feedbackTimeoutRef.current = window.setTimeout(() => {
        loadNextFlag();
      }, 380);
    } else {
      setTotalIncorrect((prev) => prev + 1);
      setStreak(0);
      setFeedback('wrong');
      soundEngine.playRushWrong();

      // Show answer reveal then auto-advance (~900ms)
      feedbackTimeoutRef.current = window.setTimeout(() => {
        loadNextFlag();
      }, 900);
    }
  };

  // Hint Button (-5 seconds penalty)
  const handleUseHint = () => {
    if (!currentCountry || hintUsedOnCurrent || remainingMs < 5000 || finishedRef.current) {
      return;
    }

    // Apply 5s penalty directly to monotonic deadline
    deadlineRef.current -= 5000;
    soundEngine.playHintPenalty();
    setHintUsedOnCurrent(true);

    const generatedHint = poolRef.current.getHint(currentCountry);
    setHint(generatedHint);

    // Check if penalty dropped remaining time to 0
    if (deadlineRef.current - performance.now() <= 0) {
      completeRun(currentCountry);
    }
  };

  // Format remaining time MM:SS
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = totalSeconds <= 15;
  const isCritical = totalSeconds <= 5;

  const countryCode = currentCountry?.code.toLowerCase() || 'un';
  const flagRatio = flagRatios[countryCode] || 1.5;
  const isNepal = countryCode === 'np';

  return (
    <div className={`flagrush-screen-container ${isUrgent ? 'rush-urgent-mode' : ''} ${isCritical ? 'rush-critical-mode' : ''}`}>
      {/* Top HUD Bar */}
      <header className="rush-hud-bar">
        <div className="rush-hud-left">
          <div className="rush-mode-tag">
            <Zap size={14} className="rush-zap-icon" />
            <span className="rush-mode-name">FLAG RUSH</span>
          </div>
          <button
            type="button"
            className="rush-quit-btn"
            onClick={() => {
              if (window.confirm('Abandon Flag Rush run and return to home?')) {
                soundEngine.pauseMusic();
                onExit();
              }
            }}
            title="Exit to Home"
          >
            EXIT
          </button>
        </div>

        {/* Central Prominent Monotonic Timer */}
        <div className="rush-hud-center">
          <div className={`rush-timer-box ${isUrgent ? 'timer-pulse-urgent' : ''}`} aria-label={`Time remaining: ${timeDisplay}`}>
            <span className="rush-timer-digits">{timeDisplay}</span>
            {isUrgent && <span className="rush-timer-badge">FINAL SECONDS</span>}
          </div>
        </div>

        {/* Score & Streak Counters */}
        <div className="rush-hud-right">
          <div className="rush-stat-tile">
            <span className="stat-tile-label">SCORE</span>
            <span className="stat-tile-val">{score}</span>
          </div>
          <div className="rush-stat-tile">
            <span className="stat-tile-label">STREAK</span>
            <span className="stat-tile-val">{streak > 0 ? `${streak}🔥` : '0'}</span>
          </div>
          <AudioControls />
        </div>
      </header>

      {/* Main Rush Play Arena */}
      <main className="rush-play-arena">
        {currentCountry && (
          <div className="rush-card-frame">
            {/* Flag Viewport */}
            <div className="rush-flag-viewport">
              <div
                className={`rush-flag-mount ${isNepal ? 'flag-frame-nepal' : 'flag-frame-rectangular'}`}
                style={{ aspectRatio: `${flagRatio}` }}
              >
                <img
                  src={`/flags/${countryCode}.svg`}
                  alt="Identify this flag"
                  className="rush-flag-img"
                  loading="eager"
                />
              </div>

              {/* In-game Hint Panel */}
              {hint && (
                <div className="rush-hint-bubble">
                  <HelpCircle size={14} />
                  <span>{hint}</span>
                </div>
              )}
            </div>

            {/* Sub-flag Controls: Hint & Prompt */}
            <div className="rush-controls-row">
              <span className="rush-prompt-text">NAME THIS COUNTRY</span>
              <button
                type="button"
                className={`rush-hint-btn ${hintUsedOnCurrent ? 'hint-used' : ''} ${remainingMs < 5000 ? 'hint-locked' : ''}`}
                onClick={handleUseHint}
                disabled={hintUsedOnCurrent || remainingMs < 5000 || feedback !== 'none'}
                title={remainingMs < 5000 ? 'Needs at least 5 seconds on clock' : 'Deducts 5 seconds for a clue'}
              >
                <HelpCircle size={13} />
                <span>{hintUsedOnCurrent ? 'HINT USED' : remainingMs < 5000 ? 'NEED ≥5S' : 'HINT -5 SEC'}</span>
              </button>
            </div>

            {/* Guess Input & Button Form */}
            <form className="rush-input-form" onSubmit={handleGuessSubmit}>
              <div className="rush-input-group">
                <input
                  ref={inputRef}
                  type="text"
                  className={`rush-text-input ${feedback === 'correct' ? 'input-correct-flash' : ''} ${feedback === 'wrong' ? 'input-wrong-flash' : ''}`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="ENTER NATION NAME..."
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  disabled={feedback !== 'none' || finishedRef.current}
                  autoFocus
                />
                <button
                  type="submit"
                  className="rush-submit-btn"
                  disabled={feedback !== 'none' || !inputValue.trim() || finishedRef.current}
                >
                  <span>GUESS</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>

            {/* Instant Feedback Notifications */}
            {feedback === 'correct' && (
              <div className="rush-feedback-overlay feedback-correct" role="alert">
                <span className="feedback-title">✓ CORRECT!</span>
                <span className="feedback-points">+1 POINT</span>
              </div>
            )}

            {feedback === 'wrong' && (
              <div className="rush-feedback-overlay feedback-wrong" role="alert">
                <span className="feedback-title">✕ WRONG!</span>
                <span className="feedback-reveal">
                  Correct answer: <strong>{currentCountry.name}</strong>
                </span>
                {lastUserGuess && <span className="feedback-guess">You typed: &ldquo;{lastUserGuess}&rdquo;</span>}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

