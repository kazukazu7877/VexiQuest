import React, { useState } from 'react';
import type { FlagRushPersonalBest } from '../types/game';
import { Trophy, X, ArrowRight, Zap } from './Icons';
import { soundEngine } from '../utils/soundEngine';

interface FlagRushInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCountdown: () => void;
  personalBest: FlagRushPersonalBest;
}

export const FlagRushInfoModal: React.FC<FlagRushInfoModalProps> = ({
  isOpen,
  onClose,
  onStartCountdown,
  personalBest,
}) => {
  const [isReady, setIsReady] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    soundEngine.playClick();
    setIsReady(false);
    onClose();
  };

  const handleYes = () => {
    soundEngine.playClick();
    setIsReady(true);
  };

  const handleStart = () => {
    soundEngine.playClick();
    setIsReady(false);
    onStartCountdown();
  };

  return (
    <div className="retro-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="flagrush-modal-title">
      <div className="retro-modal-window flagrush-modal-window">
        {/* Header with Title and Visible X Button */}
        <div className="modal-header-bar flagrush-header-bar">
          <div className="modal-title-with-icon">
            <Zap size={18} className="modal-icon-rush" />
            <h2 id="flagrush-modal-title" className="modal-title-text">FLAG RUSH</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close Flag Rush window and return to home"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-content">
          {/* Prominent Badge */}
          <div className="flagrush-badge-banner">
            <span className="rush-time-pill">⚡ 60 SECONDS</span>
            {personalBest.highScore > 0 && (
              <span className="rush-pb-pill">
                <Trophy size={12} /> BEST: {personalBest.highScore} FLAGS
              </span>
            )}
          </div>

          <p className="modal-description-lead">
            Identify as many country flags as possible before the clock runs out.
          </p>

          {/* Rules List */}
          <div className="flagrush-rules-panel">
            <div className="rush-rule-item">
              <span className="rule-bullet">▶</span>
              <span>Every correct answer earns <strong>1 point</strong>.</span>
            </div>
            <div className="rush-rule-item">
              <span className="rule-bullet">▶</span>
              <span>All <strong>195 sovereign national flags</strong> are eligible.</span>
            </div>
            <div className="rush-rule-item">
              <span className="rule-bullet">▶</span>
              <span>Wrong answers reveal the correct country and auto-advance.</span>
            </div>
            <div className="rush-rule-item">
              <span className="rule-bullet">▶</span>
              <span>Hints cost <strong>5 seconds</strong> penalty from the clock.</span>
            </div>
            <div className="rush-rule-item">
              <span className="rule-bullet">▶</span>
              <span>No lives. Pure speed and accuracy.</span>
            </div>
            <div className="rush-rule-item">
              <span className="rule-bullet">▶</span>
              <span>The timer never pauses once started.</span>
            </div>
          </div>

          {/* Interactive Readiness Section */}
          <div className="rush-ready-section">
            {!isReady ? (
              <div className="rush-prompt-box">
                <div className="rush-prompt-question">ARE YOU READY?</div>
                <button
                  type="button"
                  className="rush-yes-btn"
                  onClick={handleYes}
                  autoFocus
                >
                  YES!
                </button>
              </div>
            ) : (
              <div className="rush-launch-box">
                <div className="rush-ready-confirmed">GET READY!</div>
                <button
                  type="button"
                  className="modal-primary-btn rush-start-btn"
                  onClick={handleStart}
                  autoFocus
                >
                  <span>START FLAG RUSH</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

