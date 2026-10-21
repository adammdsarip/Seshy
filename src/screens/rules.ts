import type { GameType } from '../domain/types';

/** Player-facing rules text. It mirrors src/domain/rules, which is what the game really enforces. */
export const RULES: Record<GameType, string[]> = {
  skate: [
    'The setter calls and lands a trick. Everyone else has to match it.',
    'Miss a match and you take the next letter of S-K-A-T-E.',
    'Miss your own set and the set passes on.',
    'Five letters and you’re out. Last skater standing wins.',
  ],
  'skate-dice': [
    'Roll the dice for a random stance and trick.',
    'Land it to score its difficulty: 1, 2 or 3 points.',
    'Everyone rolls once per round.',
    'Most points wins. Tied? Most landed tricks wins.',
  ],
};
