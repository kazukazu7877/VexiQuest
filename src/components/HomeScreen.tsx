import React, { useState, useEffect } from 'react';
import type { Difficulty, PersonalBests } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../types/game';
import { InteractiveGlobe } from './InteractiveGlobe';
import { AudioControls } from './AudioControls';
import { Compass, Trophy, ArrowRight } from './Icons';
import { soundEngine } from '../utils/soundEngine';

interface HomeScreenProps {
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  onStartGame: () => void;
  personalBests: PersonalBests;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  personalBests
}) => {
  const handleSelect = (diff: Difficulty) => {
    soundEngine.playClick();
    onSelectDifficulty(diff);
  };

  const handleStart = () => {
    soundEngine.playClick();
    onStartGame();
  };

  // Dynamically responsive globe sizing for strict single-viewport fit
  const getResponsiveGlobeSize = () => {
    if (typeof window === 'undefined') return 155;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    if (vh < 600 || vw < 380) return 96;
    if (vh < 700) return 118;
    if (vh < 820) return 138;
    return 162;
  };

  const [globeSize, setGlobeSize] = useState(getResponsiveGlobeSize);

  useEffect(() => {
    const handleResize = () => {
      setGlobeSize(getResponsiveGlobeSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="home-screen-container">
      {/* Top Header Bar */}
      <header className="home-header-nav">
        <div className="arcade-system-badge">
          <Compass size={14} className="badge-compass-icon" />
          <span className="badge-arcade-text">VEXIQUEST ARCADE SYSTEM</span>
        </div>
        <AudioControls />
      </header>

      {/* Main Hero & Globe Section */}
      <main className="home-hero-layout">
        <div className="home-title-group">
          <h1 className="home-title">VEXIQUEST</h1>
          <p className="home-tagline">195 NATIONS. ONE CURIOUS MIND.</p>
        </div>

        {/* Interactive 3D Canvas Globe with Arcade Bezel */}
        <div className="globe-interactive-showcase">
          <InteractiveGlobe size={globeSize} />
          <div className="globe-caption-hint">
            <span className="coord-text">LAT 48°51′N  •  LON 02°20′E</span>
          </div>
        </div>

        {/* Difficulty Selection Cartridges */}
        <section className="difficulty-tier-selection" aria-label="Select Expedition Difficulty">
          <div className="section-label-bar">
            <span className="section-pixel-dot" />
            <span className="section-label-text">SELECT EXPEDITION DIFFICULTY</span>
            <span className="section-pixel-dot" />
          </div>

          <div className="difficulty-tiers-grid">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
              const config = DIFFICULTY_CONFIGS[diff];
              const isSelected = selectedDifficulty === diff;
              const pb = personalBests[diff];

              return (
                <div
                  key={diff}
                  className={`tier-card tier-${diff} ${isSelected ? 'tier-active' : ''}`}
                  onClick={() => handleSelect(diff)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(diff); }}
                  aria-pressed={isSelected}
                >
                  <div className="tier-header-row">
                    <span className="tier-name">{config.name.toUpperCase()}</span>
                    <span className={`tier-led-dot ${isSelected ? 'led-active' : ''}`} />
                  </div>

                  <div className="tier-lives-row">
                    <span className="tier-lives-label">
                      {config.startingLives} {config.startingLives === 1 ? 'LIFE' : 'LIVES'}
                    </span>
                    <span className="tier-pts-badge">+{config.correctPoints} PTS</span>
                  </div>

                  <div className="tier-rule-tag">{config.hintPolicy}</div>
                  <p className="tier-description">{config.description}</p>

                  {/* Personal Best Record */}
                  <div className="tier-record-footer">
                    <Trophy size={11} className="record-trophy-icon" />
                    <span className="record-label">BEST:</span>
                    <span className="record-score">{pb ? pb.highScore : 0} PTS</span>
                    {pb && pb.bestStreak > 0 && (
                      <span className="record-streak">({pb.bestStreak} STREAK)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Main CTA: Start Expedition */}
        <div className="home-action-wrap">
          <button
            type="button"
            className="start-expedition-btn"
            onClick={handleStart}
            autoFocus
          >
            <span className="btn-label-text">START EXPEDITION</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </main>

      {/* Retro Arcade Footer */}
      <footer className="home-bottom-bar">
        <div className="footer-coordinates">
          <span>COORDINATES: LAT 00°00′00″</span>
          <span className="footer-dot">•</span>
          <span>195 SOVEREIGN FLAGS</span>
          <span className="footer-dot">•</span>
          <span>INSERT COIN / PRESS START</span>
        </div>
      </footer>
    </div>
  );
};
