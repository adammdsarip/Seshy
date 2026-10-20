import type { MatchSnapshot, SkateAttempt, SkateMatch, Standing, TurnStatus } from '../types';
import { competitionRanks } from './ranks';

/**
 * Game of S.K.A.T.E. rules.
 *
 * - The setter attempts a trick. Miss it and the set passes to the next
 *   player still in the game. Land it and every other remaining player, in
 *   turn order, must match it.
 * - A player who fails to match earns the next letter of S-K-A-T-E.
 * - The setter keeps setting until they miss.
 * - Five letters and you're out. Last skater standing wins.
 *
 * State is derived from the event log alone, so the same log can come from a
 * single phone (pass-and-play) or be synced between phones (online).
 */

export const SKATE_WORD = 'SKATE';
export const MAX_LETTERS = SKATE_WORD.length;

export class InvalidMoveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMoveError';
  }
}

export interface SkateState {
  letters: Record<string, number>;
  setterId: string | null;
  /** The landed trick everyone else still has to match. */
  activeSet: { trick: string; setterId: string; pending: string[] } | null;
  finished: boolean;
  winnerId: string | null;
  turn: (TurnStatus & { role: 'set' | 'match'; trick?: string }) | null;
}

export function lettersLabel(count: number): string {
  return SKATE_WORD.slice(0, Math.min(count, MAX_LETTERS)).split('').join('-');
}

export function deriveSkate(match: Pick<SkateMatch, 'playerIds' | 'events'>): SkateState {
  const order = match.playerIds;
  if (order.length < 2) throw new InvalidMoveError('Game of S.K.A.T.E. needs at least two players');

  const letters: Record<string, number> = Object.fromEntries(order.map((id) => [id, 0]));
  const isIn = (id: string) => (letters[id] ?? 0) < MAX_LETTERS;
  const remainingAfter = (id: string) => {
    const start = order.indexOf(id);
    const result: string[] = [];
    for (let step = 1; step < order.length; step++) {
      const candidate = order[(start + step) % order.length]!;
      if (isIn(candidate)) result.push(candidate);
    }
    return result;
  };

  let setterId: string = order[0]!;
  let activeSet: SkateState['activeSet'] = null;
  let finished = false;

  for (const event of match.events) {
    if (finished) throw new InvalidMoveError(`Attempt ${event.id} came after the game ended`);

    if (activeSet === null) {
      if (event.role !== 'set' || event.playerId !== setterId) {
        throw new InvalidMoveError(`Expected ${setterId} to set, got ${event.playerId} (${event.role})`);
      }
      if (event.landed) {
        activeSet = { trick: event.trick, setterId, pending: remainingAfter(setterId) };
      } else {
        setterId = remainingAfter(setterId)[0]!;
      }
      continue;
    }

    const expected = activeSet.pending[0];
    if (event.role !== 'match' || event.playerId !== expected) {
      throw new InvalidMoveError(`Expected ${expected} to match, got ${event.playerId} (${event.role})`);
    }
    if (!event.landed) letters[event.playerId] = (letters[event.playerId] ?? 0) + 1;
    activeSet.pending.shift();
    if (activeSet.pending.length === 0) activeSet = null;
    if (order.filter(isIn).length <= 1) {
      finished = true;
      activeSet = null;
    }
  }

  const winnerId = finished ? (order.find(isIn) ?? null) : null;
  let turn: SkateState['turn'] = null;
  if (!finished) {
    turn = activeSet
      ? { playerId: activeSet.pending[0]!, role: 'match', trick: activeSet.trick, action: `to match ${activeSet.trick}` }
      : { playerId: setterId, role: 'set', action: 'to set a trick' };
  }

  return { letters, setterId: finished ? null : setterId, activeSet, finished, winnerId, turn };
}

/** The attempt the current player should make next — used by gameplay UIs. */
export function nextSkateAttempt(state: SkateState): Pick<SkateAttempt, 'playerId' | 'role'> & { trick?: string } | null {
  if (!state.turn) return null;
  return { playerId: state.turn.playerId, role: state.turn.role, trick: state.turn.trick };
}

export function skateSnapshot(match: Pick<SkateMatch, 'playerIds' | 'events'>): MatchSnapshot {
  const state = deriveSkate(match);
  const sorted = [...match.playerIds].sort(
    (a, b) => state.letters[a]! - state.letters[b]! || match.playerIds.indexOf(a) - match.playerIds.indexOf(b),
  );
  const ranks = competitionRanks(sorted, (a, b) => state.letters[a] === state.letters[b]);
  const standings: Standing[] = sorted.map((playerId, i) => {
    const count = state.letters[playerId]!;
    return {
      playerId,
      rank: ranks[i]!,
      isLeader: ranks[i] === 1 && count < MAX_LETTERS,
      eliminated: count >= MAX_LETTERS,
      progressLabel: count === 0 ? 'No letters' : lettersLabel(count),
      letters: count,
    };
  });
  return { standings, turn: state.turn, finished: state.finished, winnerId: state.winnerId };
}
