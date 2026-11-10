import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../utils/soundEngine';

interface FlagRushCountdownProps {
  onCountdownComplete: () => void;
}

export const FlagRushCountdown: React.FC<FlagRushCountdownProps> = ({ onCountdownComplete }) => {
  const [stage, setStage] = useState<'3' | '2' | '1' | 'GO!'>('3');
  const completedRef = useRef(false);

  useEffect(() => {
    // Play initial beep for 3
    soundEngine.playCountdownBeep(false);

    const timer2 = setTimeout(() => {
      setStage('2');
      soundEngine.playCountdownBeep(false);
    }, 1000);

    const timer1 = setTimeout(() => {
      setStage('1');
      soundEngine.playCountdownBeep(false);
    }, 2000);

    const timerGo = setTimeout(() => {
      setStage('GO!');
      soundEngine.playCountdownBeep(true);
    }, 3000);

    const timerComplete = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onCountdownComplete();
      }
    }, 3800);

    return () => {
      clearTimeout(timer2);
      clearTimeout(timer1);
      clearTimeout(timerGo);
      clearTimeout(timerComplete);
    };
  }, [onCountdownComplete]);

  return (
    <div className="countdown-overlay" role="status" aria-live="polite">
      <div className="countdown-content">
        <div className="countdown-subtitle">FLAG RUSH STARTS IN</div>
        <div key={stage} className={`countdown-number ${stage === 'GO!' ? 'countdown-go' : ''}`}>
          {stage}
        </div>
        <div className="countdown-tip">Prepare to guess as fast as you can!</div>
      </div>
    </div>
  );
};

