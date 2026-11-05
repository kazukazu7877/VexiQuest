import React, { useState } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { Volume2, VolumeX, Bell, BellOff, Settings } from './Icons';

interface AudioControlsProps {
  compact?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ compact = false }) => {
  const [musicOn, setMusicOn] = useState(soundEngine.musicEnabled);
  const [sfxOn, setSfxOn] = useState(soundEngine.sfxEnabled);
  const [volume, setVolume] = useState(soundEngine.volume);
  const [showSettings, setShowSettings] = useState(false);

  const handleToggleMusic = () => {
    soundEngine.playClick();
    const state = soundEngine.toggleMusic();
    setMusicOn(state);
  };

  const handleToggleSfx = () => {
    soundEngine.playClick();
    const state = soundEngine.toggleSfx();
    setSfxOn(state);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  return (
    <div className={`audio-controls-panel ${compact ? 'audio-compact' : ''}`}>
      <button
        type="button"
        className={`arcade-ctrl-btn ${musicOn ? 'active' : 'muted'}`}
        onClick={handleToggleMusic}
        title={musicOn ? 'Mute Music' : 'Unmute Music'}
        aria-label={musicOn ? 'Mute Music' : 'Unmute Music'}
      >
        <span className="audio-icon-wrap">
          {musicOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </span>
        {!compact && <span className="audio-btn-label">BGM</span>}
        <span className={`ctrl-led-indicator ${musicOn ? 'led-on' : 'led-off'}`} />
      </button>

      <button
        type="button"
        className={`arcade-ctrl-btn ${sfxOn ? 'active' : 'muted'}`}
        onClick={handleToggleSfx}
        title={sfxOn ? 'Mute Sound FX' : 'Unmute Sound FX'}
        aria-label={sfxOn ? 'Mute Sound FX' : 'Unmute Sound FX'}
      >
        <span className="audio-icon-wrap">
          {sfxOn ? <Bell size={14} /> : <BellOff size={14} />}
        </span>
        {!compact && <span className="audio-btn-label">SFX</span>}
        <span className={`ctrl-led-indicator ${sfxOn ? 'led-on' : 'led-off'}`} />
      </button>

      <div className="volume-slider-wrapper">
        <button
          type="button"
          className="arcade-ctrl-btn volume-cog-btn"
          onClick={() => setShowSettings(!showSettings)}
          title="Adjust Volume"
          aria-label="Adjust Volume"
          aria-expanded={showSettings}
        >
          <span className="audio-icon-wrap">
            <Settings size={14} />
          </span>
        </button>

        {showSettings && (
          <div className="volume-popover">
            <div className="popover-title">MASTER VOL</div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="Volume Slider"
            />
            <div className="volume-readout">{Math.round(volume * 100)}%</div>
          </div>
        )}
      </div>
    </div>
  );
};
