import React, { useState, useEffect } from 'react';
import type { Difficulty, PersonalBests, FlagRushPersonalBest } from '../types/game';
import { InteractiveGlobe } from './InteractiveGlobe';
import { AudioControls } from './AudioControls';
import { Compass, Trophy, Zap, ArrowRight } from './Icons';
import { ClassicInfoModal } from './ClassicInfoModal';
import { FlagRushInfoModal } from './FlagRushInfoModal';
import { soundEngine } from '../utils/soundEngine';

interface HomeScreenProps {
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  onStartClassic: () => void;
  onStartFlagRushCountdown: () => void;
  personalBests: PersonalBests;
  flagRushBest: FlagRushPersonalBest;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedDifficulty,
  onSelectDifficulty,
  onStartClassic,
  onStartFlagRushCountdown,
  personalBests,
  flagRushBest,
}) => {
  const [isClassicModalOpen, setIsClassicModalOpen] = useState(false);
  const [isFlagRushModalOpen, setIsFlagRushModalOpen] = useState(false);

  // Dynamically responsive globe sizing for strict single-viewport fit
  const getResponsiveGlobeSize = () => {
    if (typeof window === 'undefined') return 145;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    if (vh < 600 || vw < 380) return 90;
    if (vh < 700) return 110;
    if (vh < 820) return 130;
    return 145;
  };

  const [globeSize, setGlobeSize] = useState(getResponsiveGlobeSize);

  useEffect(() => {
    const handleResize = () => {
      setGlobeSize(getResponsiveGlobeSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenClassic = () => {
    soundEngine.playClick();
    setIsClassicModalOpen(true);
  };

  const handleOpenFlagRush = () => {
    soundEngine.playClick();
    setIsFlagRushModalOpen(true);
  };

  // Find overall highest score across classic difficulties
  const classicHighScore = Math.max(
    personalBests.easy?.highScore || 0,
    personalBests.medium?.highScore || 0,
    personalBests.hard?.highScore || 0
  );

  return (
    <div className="home-screen-container">
      {/* 1. Top Arcade Control Bar */}
      <header className="home-header-nav">
        <div className="arcade-system-badge">
          <Compass size={14} className="badge-compass-icon" />
          <span className="badge-arcade-text">VEXIQUEST ARCADE SYSTEM</span>
        </div>
        <AudioControls />
      </header>

      {/* Main Hero & Mode Selection Layout */}
      <main className="home-hero-layout">
        {/* 2. Welcome to + Supplied Wordmark + Tagline + Vexillology Subtitle */}
        <div className="home-brand-showcase">
          <span className="home-welcome-lead">WELCOME TO</span>
          <div className="home-wordmark-wrapper">
            <img
              src="/branding/vexiquest-wordmark.png"
              alt="VEXIQUEST"
              className="home-pixel-wordmark"
              loading="eager"
            />
          </div>
          <p className="home-tagline">GUESS THE WORLD, ONE FLAG AT A TIME.</p>
          <p className="home-vexillology-subtitle">A GAME BASED ON VEXILLOLOGY</p>
        </div>

        {/* 3. Floating Rotating Pixel-Art Earth in Cosmos */}
        <div className="globe-interactive-showcase">
          <InteractiveGlobe size={globeSize} />
        </div>

        {/* 4. Mode Selection Section Label (Amber Arcade Plaque) */}
        <section className="mode-selection-section" aria-label="Select Game Mode">
          <div className="mode-section-plaque">
            <span className="plaque-dot" />
            <h2 className="plaque-text">SELECT A MODE</h2>
            <span className="plaque-dot" />
          </div>

          {/* 5. Two Mode Cards (Classic Left, Flag Rush Right) */}
          <div className="modes-selection-grid">
            {/* CLASSIC MODE CARD */}
            <div
              className="mode-card mode-card-classic"
              onClick={handleOpenClassic}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleOpenClassic();
              }}
              aria-label="Classic Mode: Explore 195 flags with lives and hints across three difficulty levels"
            >
              <div className="mode-card-badge">THREE DIFFICULTY LEVELS</div>
              <div className="mode-card-header">
                <div className="mode-icon-box mode-icon-compass">
                  <Compass size={22} />
                </div>
                <div className="mode-title-wrap">
                  <h3 className="mode-title">CLASSIC</h3>
                  <span className="mode-tag">EXPEDITION</span>
                </div>
              </div>

              <p className="mode-desc">
                Take your time. Explore 195 flags, use hints and test your geographical knowledge.
              </p>

              <div className="mode-card-footer">
                <div className="mode-best-stat">
                  <Trophy size={12} />
                  <span>BEST: {classicHighScore} PTS</span>
                </div>
                <span className="mode-action-link">
                  <span>SELECT</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>

            {/* FLAG RUSH MODE CARD */}
            <div
              className="mode-card mode-card-flagrush"
              onClick={handleOpenFlagRush}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleOpenFlagRush();
              }}
              aria-label="Flag Rush: 60-second time attack frenzy"
            >
              <div className="mode-card-badge badge-rush">60-SECOND TIME ATTACK</div>
              <div className="mode-card-header">
                <div className="mode-icon-box mode-icon-rush">
                  <Zap size={22} />
                </div>
                <div className="mode-title-wrap">
                  <h3 className="mode-title">FLAG RUSH</h3>
                  <span className="mode-tag tag-speed">SPEEDRUN</span>
                </div>
              </div>

              <p className="mode-desc">
                How many country flags can you identify in just 60 seconds?
              </p>

              <div className="mode-card-footer">
                <div className="mode-best-stat">
                  <Trophy size={12} />
                  <span>BEST: {flagRushBest.highScore} FLAGS</span>
                </div>
                <span className="mode-action-link link-rush">
                  <span>PLAY NOW</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </section>
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

      {/* Classic Info Modal */}
      <ClassicInfoModal
        isOpen={isClassicModalOpen}
        onClose={() => setIsClassicModalOpen(false)}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={onSelectDifficulty}
        onStartGame={() => {
          setIsClassicModalOpen(false);
          onStartClassic();
        }}
        personalBests={personalBests}
      />

      {/* Flag Rush Info Modal */}
      <FlagRushInfoModal
        isOpen={isFlagRushModalOpen}
        onClose={() => setIsFlagRushModalOpen(false)}
        onStartCountdown={() => {
          setIsFlagRushModalOpen(false);
          onStartFlagRushCountdown();
        }}
        personalBest={flagRushBest}
      />
    </div>
  );
};
