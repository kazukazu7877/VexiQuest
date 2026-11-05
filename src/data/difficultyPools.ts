import { countries, type Country } from './countries';
import type { Difficulty } from '../types/game';

// 48 Highly recognizable countries spanning all global continents
export const EASY_COUNTRY_CODES: readonly string[] = [
  // Asia
  'jp', 'cn', 'in', 'kr', 'sa', 'tr', 'vn', 'th', 'np', 'ae', 'sg', 'id',
  // Americas
  'us', 'ca', 'mx', 'br', 'ar', 'co', 'jm', 'cu', 'cl', 'pe',
  // Europe
  'gb', 'fr', 'de', 'it', 'es', 'gr', 'ch', 'se', 'no', 'nl', 'ie', 'pt', 'ru', 'ua',
  // Africa
  'eg', 'za', 'ng', 'ke', 'ma', 'gh', 'mg', 'et', 'dz',
  // Oceania
  'au', 'nz', 'fj'
];

// Additional 68 countries of moderate difficulty (Easy + Medium ~ 116 countries)
export const MEDIUM_ADDITIONAL_CODES: readonly string[] = [
  // Europe
  'at', 'be', 'dk', 'fi', 'is', 'pl', 'cz', 'hu', 'ro', 'hr', 'rs', 'va', 'mc', 'bg', 'sk', 'si',
  // Asia
  'pk', 'bd', 'ph', 'my', 'ir', 'iq', 'il', 'lb', 'jo', 'lk', 'qa', 'kz', 'af', 'kh', 'mm', 'kw', 'om', 'mn',
  // Africa
  'tn', 'sn', 'cm', 'ci', 'tz', 'zw', 'ug', 'ao', 'sd', 'rw', 'na', 'bw', 'mu', 'cd', 'cg', 'mz',
  // Americas
  'uy', 'bo', 'ec', 've', 'cr', 'pa', 'bs', 'tt', 'gt', 'hn', 'sv', 'ni', 'py', 'do', 'ht',
  // Oceania
  'pg', 'ws', 'to'
];

const easySet = new Set(EASY_COUNTRY_CODES);
const mediumSet = new Set([...EASY_COUNTRY_CODES, ...MEDIUM_ADDITIONAL_CODES]);

export function getCountriesForDifficulty(difficulty: Difficulty): Country[] {
  switch (difficulty) {
    case 'easy':
      return countries.filter(c => easySet.has(c.code.toLowerCase()));
    case 'medium':
      return countries.filter(c => mediumSet.has(c.code.toLowerCase()));
    case 'hard':
    default:
      return [...countries];
  }
}
