import React from 'react';

interface PixelHeartsProps {
  totalLives: number;
  currentLives: number;
  maxLives?: number;
}

export const PixelHearts: React.FC<PixelHeartsProps> = ({ currentLives, maxLives = 3 }) => {
  return (
    <div className="pixel-hearts-container" aria-label={`${currentLives} of ${maxLives} lives remaining`}>
      {Array.from({ length: maxLives }, (_, i) => {
        const isAlive = i < currentLives;
        return (
          <div
            key={i}
            className={`pixel-heart ${isAlive ? 'heart-alive' : 'heart-empty'}`}
            title={isAlive ? 'Life intact' : 'Life lost'}
          >
            <svg
              viewBox="0 0 16 16"
              width="24"
              height="24"
              className="pixel-heart-svg"
              shapeRendering="crispEdges"
            >
              {/* Outer shadow / border */}
              <path
                d="M3 1h4v1H3zm6 0h4v1H9zM2 2h2v1H2zm5 1h2v1H7zm5-1h2v1h-2zM1 3h1v5H1zm14 0h1v5h-1zm-1 5h1v2h-1zm-1 2h1v2h-1zm-1 2h1v1h-1zm-2 1h2v1h-2zm-2 1h2v1H9zm-2 1h2v1H7zm-2-1h2v1H5zm-2-1h2v1H3zm-1-1h1v-1H2zm-1-2h1v-2H1z"
                fill="#2c1a12"
              />
              {/* Heart Fill (Red if alive, desaturated stone gray if lost) */}
              <path
                d="M3 2h4v1H3zm6 0h4v1H9zM2 3h5v5H2zm7 0h5v5H9zm-7 5h2v2H2zm10 0h2v2h-2zm-8 2h2v2H4zm6 0h2v2h-2zm-4 2h4v2H6z"
                fill={isAlive ? '#c0392b' : '#6b665c'}
              />
              {/* Highlight / Glint */}
              {isAlive && (
                <path
                  d="M4 3h2v2H4zM3 4h1v2H3z"
                  fill="#f1948a"
                />
              )}
              {/* Dark inner shadow */}
              <path
                d="M5 11h2v1H5zm4 0h2v1H9zm-2 2h2v1H7z"
                fill={isAlive ? '#78281f' : '#3f3c36'}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
