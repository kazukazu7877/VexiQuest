import React from 'react';

interface CompassLivesProps {
  currentLives: number;
  maxLives?: number;
  showText?: boolean;
}

export const CompassLives: React.FC<CompassLivesProps> = ({
  currentLives,
  maxLives = 3,
  showText = true
}) => {
  return (
    <div
      className="compass-lives-container"
      role="status"
      aria-live="polite"
      aria-label={`Lives remaining: ${currentLives} of ${maxLives}`}
    >
      {showText && (
        <div className="lives-text-block">
          <span className="lives-sublabel">LIVES</span>
          <span className="lives-counter-digits" aria-hidden="true">
            {currentLives} / {maxLives}
          </span>
        </div>
      )}

      <div className="compass-tokens-row" aria-hidden="true">
        {Array.from({ length: maxLives }, (_, i) => {
          const isAlive = i < currentLives;
          return (
            <div
              key={i}
              className={`compass-token ${isAlive ? 'token-alive' : 'token-lost'}`}
              title={isAlive ? 'Active exploration life' : 'Lost life'}
            >
              {/* Compact Pixel Arcade Exploration Token */}
              <svg
                viewBox="0 0 18 18"
                width="16"
                height="16"
                className="compass-token-svg"
              >
                {/* Outer Inset Diamond Bezel */}
                <rect
                  x="3"
                  y="3"
                  width="12"
                  height="12"
                  rx="2"
                  transform="rotate(45 9 9)"
                  fill={isAlive ? '#1C3435' : '#0F1C1D'}
                  stroke={isAlive ? '#B9823E' : '#284B45'}
                  strokeWidth="1.5"
                />

                {isAlive ? (
                  <>
                    {/* Glowing Amber Core Gem */}
                    <rect
                      x="6"
                      y="6"
                      width="6"
                      height="6"
                      transform="rotate(45 9 9)"
                      fill="#DCA252"
                    />
                    {/* North Point Indicator */}
                    <polygon
                      points="9,1.5 10.5,6.5 7.5,6.5"
                      fill="#E8DDBD"
                    />
                    {/* Center Boss */}
                    <circle cx="9" cy="9" r="1.5" fill="#12191D" />
                  </>
                ) : (
                  <>
                    {/* Oxide Red Lost Marker Cross */}
                    <line x1="6.5" y1="6.5" x2="11.5" y2="11.5" stroke="#984B3D" strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="11.5" y1="6.5" x2="6.5" y2="11.5" stroke="#984B3D" strokeWidth="1.6" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};
