import { deriveDice, deriveSkate } from '../../domain/rules';
import type { DiceAttempt, DiceDifficulty, DiceMatch, MatchMode, SkateAttempt, SkateMatch } from '../../domain/types';

/**
 * SAMPLE DATA ONLY. Plays matches through the real rules engine with a seeded
 * random number generator, so sample logs are always valid and repeatable.
 */

export function seededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const SKATE_TRICKS = [
  'Kickflip', 'Heelflip', 'Frontside 180', 'Backside 180', 'Pop Shove-it', 'Varial Flip',
  'Tre Flip', 'Hardflip', 'Nollie Flip', 'Fakie Big Spin', 'Boardslide', '50-50 Grind',
];

const DICE_STANCES = ['Regular', 'Fakie', 'Switch', 'Nollie'];
const DICE_TRICKS: Array<[string, DiceDifficulty]> = [
  ['Ollie', 1], ['Shove-it', 1], ['180', 1], ['Kickflip', 2], ['Heelflip', 2],
  ['Varial Flip', 2], ['Tre Flip', 3], ['Hardflip', 3], ['Laser Flip', 3],
];

interface SimOptions {
  id: string;
  playerIds: string[];
  /** Chance each player lands a trick (0–1). */
  skill: Record<string, number>;
  seed: number;
  startedAt: Date;
  location?: string;
  mode?: MatchMode;
  /** Stop after this many attempts, leaving the match unfinished. */
  stopAfter?: number;
  status?: 'in-progress' | 'completed' | 'abandoned';
  minutesPerAttempt?: number;
}

const MAX_SIM_ATTEMPTS = 400;

const at = (start: Date, minutes: number) => new Date(start.getTime() + minutes * 60_000).toISOString();

export function simulateSkate(o: SimOptions): SkateMatch {
  const rand = seededRandom(o.seed);
  const events: SkateAttempt[] = [];
  const step = o.minutesPerAttempt ?? 1.5;
  for (;;) {
    const state = deriveSkate({ playerIds: o.playerIds, events });
    if (state.finished || !state.turn || events.length >= (o.stopAfter ?? MAX_SIM_ATTEMPTS)) break;
    const { playerId, role, trick } = state.turn;
    events.push({
      id: `${o.id}-e${events.length + 1}`,
      at: at(o.startedAt, (events.length + 1) * step),
      playerId,
      role,
      trick: trick ?? SKATE_TRICKS[Math.floor(rand() * SKATE_TRICKS.length)]!,
      landed: rand() < (o.skill[playerId] ?? 0.5),
    });
  }
  const status = o.status ?? 'completed';
  return {
    id: o.id,
    gameType: 'skate',
    mode: o.mode ?? 'pass-and-play',
    status,
    location: o.location,
    startedAt: o.startedAt.toISOString(),
    endedAt: status === 'in-progress' ? undefined : events.at(-1)?.at,
    playerIds: o.playerIds,
    events,
  };
}

export function simulateDice(o: SimOptions & { rounds: number }): DiceMatch {
  const rand = seededRandom(o.seed);
  const events: DiceAttempt[] = [];
  const step = o.minutesPerAttempt ?? 2;
  for (;;) {
    const state = deriveDice({ playerIds: o.playerIds, events, rounds: o.rounds });
    if (state.finished || !state.nextPlayerId || events.length >= (o.stopAfter ?? MAX_SIM_ATTEMPTS)) break;
    const stance = DICE_STANCES[Math.floor(rand() * DICE_STANCES.length)]!;
    const [trick, base] = DICE_TRICKS[Math.floor(rand() * DICE_TRICKS.length)]!;
    const difficulty = Math.min(3, base + (stance === 'Regular' ? 0 : 1)) as DiceDifficulty;
    const skill = (o.skill[state.nextPlayerId] ?? 0.5) - (difficulty - 1) * 0.12;
    events.push({
      id: `${o.id}-e${events.length + 1}`,
      at: at(o.startedAt, (events.length + 1) * step),
      playerId: state.nextPlayerId,
      trick: stance === 'Regular' ? trick : `${stance} ${trick}`,
      difficulty,
      landed: rand() < skill,
    });
  }
  const status = o.status ?? 'completed';
  return {
    id: o.id,
    gameType: 'skate-dice',
    mode: o.mode ?? 'pass-and-play',
    status,
    location: o.location,
    startedAt: o.startedAt.toISOString(),
    endedAt: status === 'in-progress' ? undefined : events.at(-1)?.at,
    playerIds: o.playerIds,
    rounds: o.rounds,
    events,
  };
}
