import type { DiceMatch, MatchSnapshot, Standing } from '../types';
import { InvalidMoveError } from './skate';
import { competitionRanks } from './ranks';

/**
 * Skate Dice rules.
 *
 * - Each turn, a player rolls the dice for a random trick with a difficulty of
 *   1 (easy) to 3 (hard).
 * - Landing it scores points equal to its difficulty. Missing scores nothing.
 * - Every player rolls once per round, in turn order, for a fixed number of
 *   rounds.
 * - Most points after the last round wins. Tied on points, the player with
 *   more landed tricks wins. Still tied, it's a draw.
 */

export interface DiceState {
  points: Record<string, number>;
  landed: Record<string, number>;
  /** 1-based round currently being played (or the last round, once finished). */
  round: number;
  finished: boolean;
  winnerId: string | null;
  nextPlayerId: string | null;
}

export function deriveDice(match: Pick<DiceMatch, 'playerIds' | 'events' | 'rounds'>): DiceState {
  const order = match.playerIds;
  if (order.length < 2) throw new InvalidMoveError('Skate Dice needs at least two players');
  const totalTurns = match.rounds * order.length;
  if (match.events.length > totalTurns) throw new InvalidMoveError('More rolls than the match allows');

  const points: Record<string, number> = Object.fromEntries(order.map((id) => [id, 0]));
  const landed: Record<string, number> = Object.fromEntries(order.map((id) => [id, 0]));

  match.events.forEach((event, i) => {
    const expected = order[i % order.length];
    if (event.playerId !== expected) {
      throw new InvalidMoveError(`Expected ${expected} to roll, got ${event.playerId}`);
    }
    if (event.landed) {
      points[event.playerId]! += event.difficulty;
      landed[event.playerId]! += 1;
    }
  });

  const turnsTaken = match.events.length;
  const finished = turnsTaken === totalTurns;
  const round = Math.min(Math.floor(turnsTaken / order.length) + 1, match.rounds);

  let winnerId: string | null = null;
  if (finished) {
    const [first, second] = sortDice(order, points, landed);
    if (first !== undefined && (second === undefined || compareDice(first, second, points, landed) !== 0)) winnerId = first;
  }

  return {
    points,
    landed,
    round,
    finished,
    winnerId,
    nextPlayerId: finished ? null : order[turnsTaken % order.length]!,
  };
}

function compareDice(a: string, b: string, points: Record<string, number>, landed: Record<string, number>) {
  return points[b]! - points[a]! || landed[b]! - landed[a]!;
}

function sortDice(order: string[], points: Record<string, number>, landed: Record<string, number>) {
  return [...order].sort((a, b) => compareDice(a, b, points, landed) || order.indexOf(a) - order.indexOf(b));
}

export function diceSnapshot(match: Pick<DiceMatch, 'playerIds' | 'events' | 'rounds'>): MatchSnapshot {
  const state = deriveDice(match);
  const sorted = sortDice(match.playerIds, state.points, state.landed);
  const ranks = competitionRanks(sorted, (a, b) => compareDice(a, b, state.points, state.landed) === 0);
  const standings: Standing[] = sorted.map((playerId, i) => ({
    playerId,
    rank: ranks[i]!,
    isLeader: ranks[i] === 1 && state.points[playerId]! > 0,
    eliminated: false,
    progressLabel: pointsLabel(state.points[playerId]!),
    points: state.points[playerId],
    landed: state.landed[playerId],
  }));
  return {
    standings,
    turn: state.nextPlayerId ? { playerId: state.nextPlayerId, action: 'to roll' } : null,
    finished: state.finished,
    winnerId: state.winnerId,
    progressNote: state.finished ? `${match.rounds} rounds played` : `Round ${state.round} of ${match.rounds}`,
  };
}

export const pointsLabel = (points: number) => `${points} ${points === 1 ? 'pt' : 'pts'}`;
