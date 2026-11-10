// VexiQuest Sound & Music Engine — Retro Arcade × Treasure Hunt Edition
// Powered by procedural Web Audio synthesis for warm, nostalgic 16-bit chiptune melodies and crisp retro arcade SFX.

interface PatternStep {
  note: string | null;
  bass: string | null;
  perc: boolean;
  accent?: boolean;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private isMusicPlaying: boolean = false;
  private currentTrack: 'intro' | 'gameplay' | 'flagrush' | 'flagrush-intense' | null = null;
  private loopTimer: number | null = null;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;

  // Settings
  public musicEnabled: boolean = true;
  public sfxEnabled: boolean = true;
  public volume: number = 0.7;

  constructor() {
    // Read saved preferences
    try {
      const savedMusic = localStorage.getItem('vexiquest_music');
      const savedSfx = localStorage.getItem('vexiquest_sfx');
      const savedVol = localStorage.getItem('vexiquest_volume');
      if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';
      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
      if (savedVol !== null) this.volume = parseFloat(savedVol);
    } catch {
      // ignore
    }
  }

  private initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.32 : 0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.55 : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('vexiquest_volume', this.volume.toString());
    } catch { /* ignore */ }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.05);
    }
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    try {
      localStorage.setItem('vexiquest_music', this.musicEnabled.toString());
    } catch { /* ignore */ }

    if (this.musicGain && this.ctx) {
      const targetGain = this.musicEnabled ? 0.32 : 0;
      this.musicGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.1);
    }

    if (this.musicEnabled && !this.isMusicPlaying && this.currentTrack) {
      this.playTrack(this.currentTrack);
    }

    return this.musicEnabled;
  }

  public toggleSfx(): boolean {
    this.sfxEnabled = !this.sfxEnabled;
    try {
      localStorage.setItem('vexiquest_sfx', this.sfxEnabled.toString());
    } catch { /* ignore */ }

    if (this.sfxGain && this.ctx) {
      const targetGain = this.sfxEnabled ? 0.55 : 0;
      this.sfxGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.05);
    }

    return this.sfxEnabled;
  }

  // ===== PROCEDURAL RETRO CHIPTUNE SYNTHESIS =====
  // Warm 16-bit filtered triangle/square synth tone for gentle retro exploration
  private playChiptuneTone(
    freq: number,
    time: number,
    duration: number = 0.28,
    type: OscillatorType = 'triangle',
    cutoff: number = 1400,
    gainLevel: number = 0.18
  ): void {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, time);
    filter.frequency.exponentialRampToValueAtTime(cutoff * 0.4, time + duration);

    // Smooth envelope with warm attack and gentle decay
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainLevel, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Soft retro bass note
  private playRetroBass(freq: number, time: number, duration: number = 0.45): void {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.22, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Light retro arcade percussion tick / hi-hat
  private playRetroPercussion(time: number, isAccent: boolean = false): void {
    if (!this.ctx || !this.musicGain) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isAccent ? 3200 : 5400, time);
    filter.Q.setValueAtTime(3.0, time);

    const gain = this.ctx.createGain();
    const peak = isAccent ? 0.08 : 0.04;
    gain.gain.setValueAtTime(peak, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
  }

  // ===== TRACK COMPOSITION (Nostalgic 16-bit Adventure Melodies) =====
  // Peaceful, mysterious expedition melody in D Minor / Dorian
  private readonly NOTE_FREQS: Record<string, number> = {
    'D2': 73.42, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'C3': 130.81,
    'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00,
    'Bb3': 233.08, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'C5': 523.25, 'D5': 587.33,
    'E5': 659.25, 'F5': 698.46, 'A5': 880.00
  };

  // 32-step cyclical nostalgic melody pattern (D minor / G minor exploration)
  private readonly MELODY_PATTERN: PatternStep[] = [
    // Measure 1: D minor
    { note: 'D4', bass: 'D2', perc: true },
    { note: 'F4', bass: null, perc: false },
    { note: 'A4', bass: null, perc: true },
    { note: 'D5', bass: null, perc: false },
    { note: 'C5', bass: 'D2', perc: true },
    { note: 'A4', bass: null, perc: false },
    { note: 'F4', bass: null, perc: true },
    { note: 'G4', bass: null, perc: false },

    // Measure 2: G minor / C
    { note: 'Bb4', bass: 'G2', perc: true },
    { note: 'A4', bass: null, perc: false },
    { note: 'G4', bass: null, perc: true },
    { note: 'D4', bass: null, perc: false },
    { note: 'F4', bass: 'C3', perc: true },
    { note: 'G4', bass: null, perc: false },
    { note: 'A4', bass: null, perc: true },
    { note: 'F4', bass: null, perc: false },

    // Measure 3: Bb Maj / A minor
    { note: 'D4', bass: 'F2', perc: true },
    { note: 'F4', bass: null, perc: false },
    { note: 'Bb4', bass: null, perc: true },
    { note: 'C5', bass: null, perc: false },
    { note: 'D5', bass: 'A2', perc: true },
    { note: 'C5', bass: null, perc: false },
    { note: 'A4', bass: null, perc: true },
    { note: 'F4', bass: null, perc: false },

    // Measure 4: Resolving cadence
    { note: 'G4', bass: 'G2', perc: true },
    { note: 'A4', bass: null, perc: false },
    { note: 'F4', bass: null, perc: true },
    { note: 'E4', bass: null, perc: false },
    { note: 'D4', bass: 'D2', perc: true },
    { note: 'A3', bass: null, perc: false },
    { note: 'D4', bass: null, perc: true },
    { note: null, bass: null, perc: false },
  ];

  // 32-step high-energy Flag Rush speedrun pattern (A minor / F major / G major driving chiptune)
  private readonly FLAGRUSH_PATTERN: PatternStep[] = [
    // Phrase 1: A minor speed drive
    { note: 'A4', bass: 'A2', perc: true, accent: true },
    { note: 'C5', bass: null, perc: false },
    { note: 'E5', bass: 'A2', perc: true },
    { note: 'A5', bass: null, perc: false },
    { note: 'G5', bass: 'A2', perc: true, accent: true },
    { note: 'E5', bass: null, perc: false },
    { note: 'C5', bass: 'A2', perc: true },
    { note: 'E5', bass: null, perc: false },

    // Phrase 2: F major power run
    { note: 'F4', bass: 'F2', perc: true, accent: true },
    { note: 'A4', bass: null, perc: false },
    { note: 'C5', bass: 'F2', perc: true },
    { note: 'F5', bass: null, perc: false },
    { note: 'E5', bass: 'F2', perc: true, accent: true },
    { note: 'C5', bass: null, perc: false },
    { note: 'A4', bass: 'F2', perc: true },
    { note: 'C5', bass: null, perc: false },

    // Phrase 3: D minor / G major sprint
    { note: 'D4', bass: 'D2', perc: true, accent: true },
    { note: 'F4', bass: null, perc: false },
    { note: 'A4', bass: 'D2', perc: true },
    { note: 'D5', bass: null, perc: false },
    { note: 'B4', bass: 'G2', perc: true, accent: true },
    { note: 'G4', bass: null, perc: false },
    { note: 'D5', bass: 'G2', perc: true },
    { note: 'B4', bass: null, perc: false },

    // Phrase 4: E minor climax turn
    { note: 'E4', bass: 'E2', perc: true, accent: true },
    { note: 'G4', bass: null, perc: false },
    { note: 'B4', bass: 'E2', perc: true },
    { note: 'E5', bass: null, perc: false },
    { note: 'D5', bass: 'E2', perc: true, accent: true },
    { note: 'B4', bass: null, perc: false },
    { note: 'G4', bass: 'E2', perc: true },
    { note: 'B4', bass: null, perc: false },
  ];

  public playTrack(track: 'intro' | 'gameplay' | 'flagrush' | 'flagrush-intense'): void {
    const isTrackSwitch = this.currentTrack !== track;
    this.currentTrack = track;
    if (!this.musicEnabled) return;

    this.initCtx();
    if (this.isMusicPlaying && !isTrackSwitch) return;

    if (this.isMusicPlaying && isTrackSwitch) {
      this.currentStep = 0;
      return;
    }

    this.isMusicPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = (this.ctx?.currentTime || 0) + 0.08;
    this.scheduleMusicLoop();
  }

  public pauseMusic(): void {
    this.isMusicPlaying = false;
    if (this.loopTimer !== null) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }

  public resumeMusic(): void {
    if (this.currentTrack && !this.isMusicPlaying && this.musicEnabled) {
      this.playTrack(this.currentTrack);
    }
  }

  private scheduleMusicLoop(): void {
    if (!this.isMusicPlaying || !this.ctx) return;

    const isFlagRush = this.currentTrack === 'flagrush' || this.currentTrack === 'flagrush-intense';
    const isIntense = this.currentTrack === 'flagrush-intense';

    // Classic: ~136 BPM (0.22s) | Flag Rush: ~154 BPM (0.135s) | Intense: ~170 BPM (0.11s)
    const stepDuration = isIntense ? 0.11 : isFlagRush ? 0.135 : 0.22;
    const scheduleWindow = 0.45;
    const activePattern = isFlagRush ? this.FLAGRUSH_PATTERN : this.MELODY_PATTERN;

    while (this.nextNoteTime < this.ctx.currentTime + scheduleWindow) {
      const stepData = activePattern[this.currentStep % activePattern.length];

      // 1. Play melody note
      if (stepData.note && this.NOTE_FREQS[stepData.note]) {
        const freq = this.NOTE_FREQS[stepData.note] * (isIntense && this.currentStep % 2 === 0 ? 1 : 1);
        this.playChiptuneTone(
          freq,
          this.nextNoteTime,
          stepDuration * (isFlagRush ? 0.82 : 0.92),
          isFlagRush ? 'square' : 'triangle',
          isFlagRush ? 1800 : 1350,
          isFlagRush ? 0.14 : 0.16
        );
      }

      // 2. Play bass note
      if (stepData.bass && this.NOTE_FREQS[stepData.bass]) {
        this.playRetroBass(
          this.NOTE_FREQS[stepData.bass],
          this.nextNoteTime,
          stepDuration * (isFlagRush ? 1.5 : 2.2)
        );
      }

      // 3. Play light rhythm
      if (stepData.perc) {
        this.playRetroPercussion(
          this.nextNoteTime,
          Boolean(stepData.accent || this.currentStep % 4 === 0)
        );
      }

      this.currentStep++;
      this.nextNoteTime += stepDuration;
    }

    this.loopTimer = window.setTimeout(() => this.scheduleMusicLoop(), 100);
  }

  // ===== RETRO ARCADE SOUND EFFECTS =====

  // 1. Menu Click / Button Select — Crisp 8-bit blip
  public playClick(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(980, t + 0.04);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.055);
  }

  // 2. Correct Answer — Ascending 8-bit coin / discovery chime
  public playCorrect(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, time: t, dur: 0.08 },        // C5
      { f: 659.25, time: t + 0.07, dur: 0.08 }, // E5
      { f: 783.99, time: t + 0.14, dur: 0.09 }, // G5
      { f: 1046.50, time: t + 0.21, dur: 0.28 } // C6
    ];

    notes.forEach(({ f, time, dur }) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(f, time);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(time);
      osc.stop(time + dur);
    });
  }

  // 3. Incorrect Answer — Subtle low-pitched vintage dual-tone buzz
  public playIncorrect(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(145, t);
    osc.frequency.setValueAtTime(110, t + 0.09);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, t);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.27);
  }

  // 4. Clue / Hint — Retro radar beacon ping
  public playHint(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.15);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // 5. Streak Bonus — Arcade power-up fanfare
  public playStreakBonus(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const pitches = [440, 554.37, 659.25, 880, 1108.73];

    pitches.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.06;

      osc.type = 'square';
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.18);
    });
  }

  // 6. Game Over — Nostalgic descending arcade phrase
  public playGameOver(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 392.00, time: t, dur: 0.16 },        // G4
      { f: 349.23, time: t + 0.16, dur: 0.16 }, // F4
      { f: 311.13, time: t + 0.32, dur: 0.22 }, // Eb4
      { f: 261.63, time: t + 0.54, dur: 0.55 }  // C4
    ];

    notes.forEach(({ f, time, dur }) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(time);
      osc.stop(time + dur);
    });
  }

  // ===== FLAG RUSH SPECIFIC SFX =====

  // 7. Countdown Beep (3, 2, 1) and Go!
  public playCountdownBeep(isGo: boolean = false): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    if (!isGo) {
      // 3, 2, 1: crisp retro metronome / arcade ready pulse (440Hz)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.13);
    } else {
      // GO!: triumphant rising high dual-tone (880Hz -> 1320Hz)
      [880, 1320].forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = t + idx * 0.04;
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.24, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.3);
      });
    }
  }

  // 8. Flag Rush Fast Correct (snappy arcade ping)
  public playRushCorrect(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(659.25, t); // E5
    osc.frequency.setValueAtTime(1046.50, t + 0.05); // C6

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // 9. Flag Rush Wrong Answer (fast descending buzzer)
  public playRushWrong(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  // 10. Hint Penalty (-5 seconds penalty sound)
  public playHintPenalty(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.18);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // 11. Time's Up Buzzer / Fanfare
  public playTimesUp(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Dramatic descending arcade sequence
    const notes = [
      { f: 587.33, d: 0.12, offset: 0 },
      { f: 493.88, d: 0.14, offset: 0.12 },
      { f: 440.00, d: 0.16, offset: 0.26 },
      { f: 329.63, d: 0.45, offset: 0.42 }
    ];

    notes.forEach(({ f, d, offset }) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + offset;

      osc.type = 'square';
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0.24, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + d);
    });
  }

  // 12. Copy to Clipboard Success
  public playCopySuccess(): void {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(783.99, t);
    osc.frequency.setValueAtTime(1174.66, t + 0.06);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }
}

export const soundEngine = new SoundEngine();
