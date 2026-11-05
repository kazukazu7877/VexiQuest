import React from 'react';

export const CompassRose: React.FC<{ size?: number; className?: string }> = ({ size = 64, className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={`compass-rose-svg ${className}`}
    aria-hidden="true"
  >
    {/* Outer ring */}
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1" />
    
    {/* Cardinal lines */}
    <line x1="50" y1="4" x2="50" y2="96" stroke="currentColor" strokeWidth="0.75" />
    <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" strokeWidth="0.75" />
    
    {/* Compass star points */}
    {/* North Point */}
    <polygon points="50,6 54,44 50,50" fill="currentColor" opacity="0.9" />
    <polygon points="50,6 46,44 50,50" fill="currentColor" opacity="0.4" />
    
    {/* South Point */}
    <polygon points="50,94 46,56 50,50" fill="currentColor" opacity="0.9" />
    <polygon points="50,94 54,56 50,50" fill="currentColor" opacity="0.4" />
    
    {/* East Point */}
    <polygon points="94,50 56,54 50,50" fill="currentColor" opacity="0.9" />
    <polygon points="94,50 56,46 50,50" fill="currentColor" opacity="0.4" />
    
    {/* West Point */}
    <polygon points="6,50 44,46 50,50" fill="currentColor" opacity="0.9" />
    <polygon points="6,50 44,54 50,50" fill="currentColor" opacity="0.4" />

    {/* Ordinal points (NE, NW, SE, SW) */}
    <polygon points="80,20 53,47 50,50" fill="currentColor" opacity="0.7" />
    <polygon points="80,20 47,53 50,50" fill="currentColor" opacity="0.3" />
    
    <polygon points="20,20 47,47 50,50" fill="currentColor" opacity="0.7" />
    <polygon points="20,20 53,47 50,50" fill="currentColor" opacity="0.3" />
    
    <polygon points="80,80 47,53 50,50" fill="currentColor" opacity="0.7" />
    <polygon points="80,80 53,47 50,50" fill="currentColor" opacity="0.3" />
    
    <polygon points="20,80 53,53 50,50" fill="currentColor" opacity="0.7" />
    <polygon points="20,80 47,53 50,50" fill="currentColor" opacity="0.3" />

    {/* Center boss */}
    <circle cx="50" cy="50" r="4" fill="#c59b27" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export const VintageCorner: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br'; size?: number }> = ({ position, size = 32 }) => {
  const transforms: Record<string, string> = {
    tl: 'scale(1, 1)',
    tr: 'scale(-1, 1)',
    bl: 'scale(1, -1)',
    br: 'scale(-1, -1)'
  };

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={`vintage-corner vintage-corner-${position}`}
      style={{ transform: transforms[position] }}
      aria-hidden="true"
    >
      <path
        d="M2 2 L38 2 L38 6 L6 6 L6 38 L2 38 Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M8 8 L24 8 L8 24 Z"
        fill="currentColor"
        opacity="0.4"
      />
      <circle cx="14" cy="14" r="2.5" fill="#c59b27" />
      <circle cx="4" cy="4" r="1.5" fill="currentColor" />
    </svg>
  );
};

export const GlobeIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 180, className = '' }) => (
  <div className={`globe-illustration-wrapper ${className}`} style={{ width: size, height: size }}>
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className="vintage-globe-svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="globeGlow" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#f5ecd5" />
          <stop offset="60%" stopColor="#e3cfad" />
          <stop offset="100%" stopColor="#bfa57a" />
        </radialGradient>
        <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e5c875" />
          <stop offset="50%" stopColor="#c59b27" />
          <stop offset="100%" stopColor="#8d6c15" />
        </linearGradient>
      </defs>

      {/* Stand Base */}
      <path d="M70 190 L130 190 L120 178 L80 178 Z" fill="url(#brassGrad)" stroke="#59430c" strokeWidth="1.5" />
      <rect x="94" y="152" width="12" height="28" fill="url(#brassGrad)" stroke="#59430c" strokeWidth="1" />
      <path d="M74 190 L126 190 L122 194 L78 194 Z" fill="#59430c" />

      {/* Brass Meridian Ring (Semi-circle around globe) */}
      <path
        d="M 40 40 A 85 85 0 0 0 160 160"
        fill="none"
        stroke="url(#brassGrad)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M 40 40 A 85 85 0 0 0 160 160"
        fill="none"
        stroke="#59430c"
        strokeWidth="1.5"
      />

      {/* Axis Pins */}
      <circle cx="64" cy="38" r="4" fill="url(#brassGrad)" stroke="#59430c" strokeWidth="1" />
      <circle cx="136" cy="162" r="4" fill="url(#brassGrad)" stroke="#59430c" strokeWidth="1" />

      {/* Globe Sphere with Parhment Gradient */}
      <circle cx="100" cy="100" r="62" fill="url(#globeGlow)" stroke="#4d3b23" strokeWidth="2.5" />

      {/* Latitude Parallels */}
      <ellipse cx="100" cy="100" rx="62" ry="18" fill="none" stroke="#7a6241" strokeWidth="1" strokeDasharray="3,2" />
      <ellipse cx="100" cy="74" rx="55" ry="12" fill="none" stroke="#7a6241" strokeWidth="0.8" strokeDasharray="2,2" />
      <ellipse cx="100" cy="126" rx="55" ry="12" fill="none" stroke="#7a6241" strokeWidth="0.8" strokeDasharray="2,2" />

      {/* Longitude Meridians */}
      <ellipse cx="100" cy="100" rx="28" ry="62" fill="none" stroke="#7a6241" strokeWidth="1" strokeDasharray="3,2" />
      <ellipse cx="100" cy="100" rx="48" ry="62" fill="none" stroke="#7a6241" strokeWidth="0.8" strokeDasharray="2,2" />
      <line x1="100" y1="38" x2="100" y2="162" stroke="#7a6241" strokeWidth="1" strokeDasharray="4,2" />
      <line x1="38" y1="100" x2="162" y2="100" stroke="#7a6241" strokeWidth="1.5" />

      {/* Stylized Vintage Continents (Silhouette outlines) */}
      <path
        d="M75 62 Q85 58 92 68 Q100 74 105 70 Q112 76 108 86 Q95 90 85 82 Q78 72 75 62 Z"
        fill="#2e543e"
        opacity="0.75"
        stroke="#1a3526"
        strokeWidth="0.8"
      />
      <path
        d="M84 94 Q95 90 98 100 Q104 114 96 130 Q88 124 85 110 Q80 102 84 94 Z"
        fill="#2e543e"
        opacity="0.75"
        stroke="#1a3526"
        strokeWidth="0.8"
      />
      <path
        d="M115 65 Q135 60 148 72 Q150 92 138 98 Q125 96 118 84 Q112 74 115 65 Z"
        fill="#2e543e"
        opacity="0.75"
        stroke="#1a3526"
        strokeWidth="0.8"
      />
      <path
        d="M130 112 Q144 110 148 122 Q142 132 132 130 Q126 122 130 112 Z"
        fill="#2e543e"
        opacity="0.75"
        stroke="#1a3526"
        strokeWidth="0.8"
      />

      {/* Globe Rim Shadow */}
      <circle cx="100" cy="100" r="62" fill="none" stroke="#4d3b23" strokeWidth="2.5" />
    </svg>
  </div>
);

export const OrnateDivider: React.FC<{ label?: string }> = ({ label }) => (
  <div className="ornate-divider" aria-hidden="true">
    <div className="divider-line" />
    <div className="divider-emblem">
      <span className="divider-star">✦</span>
      {label && <span className="divider-label">{label}</span>}
      <span className="divider-star">✦</span>
    </div>
    <div className="divider-line" />
  </div>
);
