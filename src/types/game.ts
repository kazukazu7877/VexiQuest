import type { Country } from '../data/countries';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ScreenState = 'home' | 'playing' | 'gameover';

export interface DifficultyConfig {
  name: string;
  difficulty: Difficulty;
  startingLives: number;
  correctPoints: number;
  hintCost: number; // 0 = free, 1 = costs 1 life, -1 = no hints allowed
  description: string;
  hintPolicy: string;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: 'Easy',
    difficulty: 'easy',
    startingLives: 3,
    correctPoints: 10,
    hintCost: 0,
    description: '3 lives. 1 optional free hint per flag. Ideal for cartographers in training.',
    hintPolicy: 'Free hint available'
  },
  medium: {
    name: 'Medium',
    difficulty: 'medium',
    startingLives: 2,
    correctPoints: 20,
    hintCost: 1,
    description: '2 lives. Hint costs 1 valuable life. High stakes for seasoned travellers.',
    hintPolicy: 'Hint costs 1 life'
  },
  hard: {
    name: 'Hard',
    difficulty: 'hard',
    startingLives: 1,
    correctPoints: 30,
    hintCost: -1,
    description: '1 life. Absolute mastery required. No hints whatsoever. One mistake ends the voyage.',
    hintPolicy: 'No hints allowed'
  }
};

export interface PersonalBest {
  highScore: number;
  bestStreak: number;
  gamesPlayed: number;
  totalCorrect: number;
}

export type PersonalBests = Record<Difficulty, PersonalBest>;

export interface AnswerResult {
  isCorrect: boolean;
  userAnswer: string;
  country: Country;
  pointsEarned: number;
  streakBonus: boolean;
  livesLost: number;
}
