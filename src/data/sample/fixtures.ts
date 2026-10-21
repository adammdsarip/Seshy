import type { Match, Player } from '../../domain/types';
import { simulateDice, simulateSkate } from './simulate';

/**
 * SAMPLE DATA ONLY — fictional skaters and matches for the Phase 1 UI.
 * Nothing in here is real, and nothing outside src/data/sample imports it
 * except the repository factory.
 */

export const SAMPLE_ME: Player = { id: 'me', username: 'Adam', handle: 'adam_skates', avatarTone: 'volt' };

export const SAMPLE_FRIENDS: Player[] = [
  { id: 'jay', username: 'Jay', handle: 'jayramp', avatarTone: 'coral' },
  { id: 'alex', username: 'Alex', handle: 'alexgrinds', avatarTone: 'cyan' },
  { id: 'mia', username: 'Mia', handle: 'mia.flips', avatarTone: 'white' },
  { id: 'sam', username: 'Sam', handle: 'sam_nollie', avatarTone: 'coral' },
];

const SKILL: Record<string, number> = { me: 0.62, jay: 0.7, alex: 0.58, mia: 0.55, sam: 0.45 };

const PARKS = ['Riverside Skatepark', 'Bedok Skatepark', 'Tampines Skatepark', 'Downtown Plaza', 'Harbour DIY'];

function daysAgo(now: Date, days: number, hour: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/** Builds the sample world relative to `now` so dates always look recent. */
export function buildSampleMatches(now = new Date()): { active: Match; finished: Match[] } {
  const crew4 = ['jay', 'alex', 'mia', 'me'];

  const active = simulateSkate({
    id: 'sample-live-1',
    playerIds: crew4,
    skill: SKILL,
    seed: 7,
    startedAt: new Date(now.getTime() - 12 * 60_000),
    location: PARKS[0],
    status: 'in-progress',
    stopAfter: 9,
    minutesPerAttempt: 1.2,
  });

  type Spec = { game: 'skate' | 'dice'; players: string[]; days: number; seed: number; status?: 'abandoned' };
  const specs: Spec[] = [
    { game: 'skate', players: ['me', 'alex'], days: 1, seed: 11 },
    { game: 'dice', players: ['me', 'jay', 'mia'], days: 2, seed: 4 },
    { game: 'skate', players: ['me', 'jay', 'alex', 'mia'], days: 3, seed: 21 },
    { game: 'skate', players: ['me', 'sam'], days: 5, seed: 3 },
    { game: 'dice', players: ['me', 'alex', 'sam'], days: 6, seed: 9, status: 'abandoned' },
    { game: 'skate', players: ['me', 'mia'], days: 8, seed: 14 },
    { game: 'dice', players: ['me', 'jay'], days: 9, seed: 30 },
    { game: 'skate', players: ['me', 'jay', 'sam'], days: 12, seed: 8 },
    { game: 'dice', players: ['me', 'alex', 'mia', 'sam'], days: 14, seed: 17 },
    { game: 'skate', players: ['me', 'jay'], days: 17, seed: 27 },
    { game: 'skate', players: ['me', 'alex', 'mia'], days: 20, seed: 5 },
    { game: 'dice', players: ['me', 'sam'], days: 23, seed: 42 },
    { game: 'skate', players: ['me', 'jay', 'alex'], days: 27, seed: 12 },
  ];

  const finished = specs.map((spec, i): Match => {
    const base = {
      id: `sample-match-${i + 1}`,
      playerIds: spec.players,
      skill: SKILL,
      seed: spec.seed,
      startedAt: daysAgo(now, spec.days, 16 + (i % 3)),
      location: PARKS[i % PARKS.length],
      status: spec.status ?? ('completed' as const),
      stopAfter: spec.status === 'abandoned' ? 5 : undefined,
    };
    return spec.game === 'skate' ? simulateSkate(base) : simulateDice({ ...base, rounds: 5 });
  });

  return { active, finished };
}
