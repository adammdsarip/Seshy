import type { Match, MatchResult, MatchSnapshot, Outcome } from '../types';
import { skateSnapshot } from './skate';
import { diceSnapshot } from './skateDice';

export { deriveSkate, lettersLabel, nextSkateAttempt, InvalidMoveError, MAX_LETTERS, SKATE_WORD } from './skate';
export { deriveDice } from './skateDice';

/** Standings, turn and winner for any match, whatever its game type. */
export function snapshotMatch(match: Match): MatchSnapshot {
  return match.gameType === 'skate' ? skateSnapshot(match) : diceSnapshot(match);
}

/**
 * Turns a finished match into the standard MatchResult. Pass-and-play and
 * online matches both go through here, so their results are identical.
 */
export function toMatchResult(match: Match): MatchResult {
  if (match.status === 'in-progress') throw new Error(`Match ${match.id} is still in progress`);
  const snapshot = snapshotMatch(match);
  const completed = match.status === 'completed';
  const winnerId = completed ? snapshot.winnerId : null;

  return {
    matchId: match.id,
    gameType: match.gameType,
    mode: match.mode,
    status: match.status,
    location: match.location,
    startedAt: match.startedAt,
    endedAt: match.endedAt ?? match.events.at(-1)?.at ?? match.startedAt,
    winnerId,
    placements: snapshot.standings.map((s) => {
      let outcome: Outcome = 'loss';
      if (winnerId === s.playerId) outcome = 'win';
      else if (winnerId === null) outcome = 'draw';
      return { playerId: s.playerId, place: s.rank, outcome, summary: s.progressLabel };
    }),
  };
}
