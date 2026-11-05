import React, { useState } from 'react';
import type { Country } from '../data/countries';
import flagRatiosData from '../data/flagRatios.json';

const flagRatios = flagRatiosData as Record<string, number>;

interface FlagCardProps {
  country: Country;
  revealed?: boolean;
}

export const FlagCard: React.FC<FlagCardProps> = ({ country, revealed = false }) => {
  const [prevCode, setPrevCode] = useState(country.code);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (prevCode !== country.code) {
    setPrevCode(country.code);
    setImgError(false);
    setImgLoaded(false);
  }

  const code = country.code.toLowerCase();
  const flagSrc = `/flags/${code}.svg`;
  const isNepal = code === 'np';
  const ratio = flagRatios[code] || 1.5;

  return (
    <div className={`atlas-flag-mount ${revealed ? 'mount-revealed' : ''}`}>
      <div className="flag-instruction-label">
        WHICH COUNTRY DOES THIS FLAG BELONG TO?
      </div>

      <div className="atlas-mount-inner">
        {/* Subtle Cartographic Registration Marks (Hairline Crosshairs) */}
        <div className="reg-mark reg-mark-tl" aria-hidden="true" />
        <div className="reg-mark reg-mark-tr" aria-hidden="true" />
        <div className="reg-mark reg-mark-bl" aria-hidden="true" />
        <div className="reg-mark reg-mark-br" aria-hidden="true" />

        <div className="flag-canvas-viewport">
          {!imgLoaded && !imgError && (
            <div className="flag-placeholder">
              <div className="flag-spinner" />
              <span>Unfurling flag...</span>
            </div>
          )}

          {!imgError ? (
            <div
              className={`flag-frame-mount ${isNepal ? 'flag-frame-nepal' : 'flag-frame-rectangular'}`}
              style={{ aspectRatio: `${ratio}` }}
            >
              <img
                src={flagSrc}
                alt={`National flag for question`}
                className={`flag-img ${imgLoaded ? 'loaded' : 'loading'}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                loading="eager"
              />
            </div>
          ) : (
            <div className="flag-fallback">
              <div className="flag-fallback-text">
                {country.name} (Code: {country.code.toUpperCase()})
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
