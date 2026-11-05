import type { Country } from '../data/countries';
import type { Difficulty } from '../types/game';
import { getCountriesForDifficulty } from '../data/difficultyPools';

export class CountryPoolManager {
  private difficulty: Difficulty;
  private pool: Country[] = [];
  private availableIndices: number[] = [];
  private lastCountryCode: string | null = null;
  private currentCycle: number = 1;

  constructor(difficulty: Difficulty = 'easy') {
    this.difficulty = difficulty;
    this.reset(difficulty);
  }

  public reset(difficulty?: Difficulty): void {
    if (difficulty) {
      this.difficulty = difficulty;
    }
    this.pool = getCountriesForDifficulty(this.difficulty);
    this.lastCountryCode = null;
    this.currentCycle = 1;
    this.reshuffle();
  }

  public setDifficulty(difficulty: Difficulty): void {
    if (this.difficulty !== difficulty) {
      this.reset(difficulty);
    }
  }

  private reshuffle(): void {
    if (this.pool.length === 0) {
      this.pool = getCountriesForDifficulty(this.difficulty);
    }

    const indices = Array.from({ length: this.pool.length }, (_, i) => i);

    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Ensure the first country of the new cycle is NOT the same as the last country of the previous cycle
    if (this.lastCountryCode && this.pool[indices[0]].code === this.lastCountryCode && indices.length > 1) {
      const swapIndex = Math.floor(Math.random() * (indices.length - 1)) + 1;
      [indices[0], indices[swapIndex]] = [indices[swapIndex], indices[0]];
    }

    this.availableIndices = indices;
  }

  public getNextCountry(): { country: Country; cycle: number } {
    if (this.availableIndices.length === 0) {
      this.currentCycle++;
      this.reshuffle();
    }

    const nextIndex = this.availableIndices.shift()!;
    const country = this.pool[nextIndex];
    this.lastCountryCode = country.code;

    return {
      country,
      cycle: this.currentCycle
    };
  }

  public getRandomHint(country: Country, excludedHints: string[] = []): string {
    const validHints = country.hints.filter(h => !excludedHints.includes(h));
    if (validHints.length === 0) {
      return country.hints[Math.floor(Math.random() * country.hints.length)];
    }
    return validHints[Math.floor(Math.random() * validHints.length)];
  }

  public getPoolSize(): number {
    return this.pool.length;
  }

  public getRemainingInCycle(): number {
    return this.availableIndices.length;
  }
}
