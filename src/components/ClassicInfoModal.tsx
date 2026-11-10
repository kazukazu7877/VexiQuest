import React from 'react';
import type { Difficulty, PersonalBests } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../types/game';
import { Compass, Trophy, X, ArrowRight } from './Icons';
import { soundEngine } from '../utils/soundEngine';

interface ClassicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  onStartGame: () => void;
  personalBests: PersonalBests;
}

export const ClassicInfoModal: React.FC<ClassicInfoModalProps> = ({
  isOpen,
  onClose,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  personalBests,
}) => {
  if (!isOpen) return null;

  const handleDifficultySelect = (diff: Difficulty) => {
    soundEngine.playClick();
    onSelectDifficulty(diff);
  };

  const handleStart = () => {
    soundEngine.playClick();
    onStartGame();
  };

  const handleClose = () => {
    soundEngine.playClick();
    onClose();
  };

  return (
    <div className="retro-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="classic-modal-title">
      <div className="retro-modal-window classic-modal-window">
        {/* Top Header with Title and Visible X Button */}
        <div className="modal-header-bar">
          <div className="modal-title-with-icon">
            <Compass size={18} className="modal-icon-compass" />
            <h2 id="classic-modal-title" className="modal-title-text">CLASSIC MODE</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close Classic Mode window and return to home"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-content">
          <p className="modal-description-lead">
            Explore the flags of 195 countries. Choose your difficulty, identify each flag and see how far your knowledge takes you.
          </p>

          {/* Difficulty Rules Table / Selectable Cards */}
          <div className="modal-difficulty-grid" role="radiogroup" aria-label="Select Classic Expedition Difficulty">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
              const cfg = DIFFICULTY_CONFIGS[diff];
              const isSelected = selectedDifficulty === diff;
              const pb = personalBests[diff];

              return (
                <div
                  key={diff}
                  className={`modal-tier-card modal-tier-${diff} ${isSelected ? 'tier-selected' : ''}`}
                  onClick={() => handleDifficultySelect(diff)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleDifficultySelect(diff);
                  }}
                >
                  <div className="modal-tier-top">
                    <span className="modal-tier-name">{cfg.name.toUpperCase()}</span>
                    <span className={`modal-tier-led ${isSelected ? 'led-on' : ''}`} />
                  </div>

                  <div className="modal-tier-stats">
                    <span className="modal-stat-lives">{cfg.startingLives} {cfg.startingLives === 1 ? 'LIFE' : 'LIVES'}</span>
                    <span className="modal-stat-pts">+{cfg.correctPoints} PTS</span>
                  </div>

                  <div className="modal-tier-rule">{cfg.hintPolicy}</div>
                  <p className="modal-tier-desc">{cfg.description}</p>

                  <div className="modal-tier-best">
                    <Trophy size={11} />
                    <span>BEST: {pb?.highScore || 0} PTS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="modal-footer-bar">
          <button
            type="button"
            className="modal-primary-btn classic-start-btn"
            onClick={handleStart}
            autoFocus
          >
            <span>START EXPEDITION</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

