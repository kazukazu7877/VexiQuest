import type { Difficulty, PersonalBests, PersonalBest } from '../types/game';

const STORAGE_KEY = 'vexiquest_records_v1';

const DEFAULT_PERSONAL_BEST: PersonalBest = {
  highScore: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  totalCorrect: 0
};

export const DEFAULT_PERSONAL_BESTS: PersonalBests = {
  easy: { ...DEFAULT_PERSONAL_BEST },
  medium: { ...DEFAULT_PERSONAL_BEST },
  hard: { ...DEFAULT_PERSONAL_BEST }
};

export function loadPersonalBests(): PersonalBests {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERSONAL_BESTS;
    const parsed = JSON.parse(raw);
    return {
      easy: { ...DEFAULT_PERSONAL_BEST, ...parsed.easy },
      medium: { ...DEFAULT_PERSONAL_BEST, ...parsed.medium },
      hard: { ...DEFAULT_PERSONAL_BEST, ...parsed.hard }
    };
  } catch {
    return DEFAULT_PERSONAL_BESTS;
  }
}

export function savePersonalBest(
  difficulty: Difficulty,
  score: number,
  streak: number,
  correctCount: number
): { bests: PersonalBests; isNewHighScore: boolean; isNewBestStreak: boolean } {
  const current = loadPersonalBests();
  const existing = current[difficulty] || { ...DEFAULT_PERSONAL_BEST };

  const isNewHighScore = score > existing.highScore;
  const isNewBestStreak = streak > existing.bestStreak;

  const updated: PersonalBests = {
    ...current,
    [difficulty]: {
      highScore: Math.max(existing.highScore, score),
      bestStreak: Math.max(existing.bestStreak, streak),
      gamesPlayed: existing.gamesPlayed + 1,
      totalCorrect: existing.totalCorrect + correctCount
    }
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }

  return { bests: updated, isNewHighScore, isNewBestStreak };
}
