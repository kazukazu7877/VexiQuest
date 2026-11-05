import type { Country } from '../data/countries';

/**
 * Normalizes a country name or user input string:
 * - Lowercases and trims
 * - Removes unicode accents / diacritics (e.g. Côte d'Ivoire -> Cote d'Ivoire)
 * - Removes common punctuation (periods, apostrophes, hyphens, commas, etc.)
 * - Replaces & with 'and'
 * - Collapses consecutive spaces
 */
export function normalizeAnswer(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/&/g, ' and ')
    .replace(/[.,'"`\-_/\\()–—]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether the user's input matches the country or any of its aliases.
 * Avoids overly broad fuzzy matching to prevent false positives.
 */
export function checkAnswer(userInput: string, country: Country): boolean {
  const normalizedInput = normalizeAnswer(userInput);
  if (!normalizedInput) return false;

  const validAnswers = [
    country.name,
    ...(country.aliases || [])
  ].map(normalizeAnswer);

  return validAnswers.includes(normalizedInput);
}
