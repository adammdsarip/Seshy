import type { PlayerDirectory } from '../data/DataProvider';
import type { MatchResult, Outcome } from '../domain/types';
import { joinNames } from './format';

export type ViewerOutcome = Outcome | 'abandoned';

export function viewerOutcome(result: MatchResult, viewerId: string): ViewerOutcome {
  if (result.status === 'abandoned') return 'abandoned';
  return result.placements.find((p) => p.playerId === viewerId)?.outcome ?? 'loss';
}

/** "You vs Alex", "You vs Jay & Mia". The result itself is shown by a WIN / LOSE badge. */
export function resultHeadline(result: MatchResult, players: PlayerDirectory): string {
  const opponents = result.placements
    .filter((p) => p.playerId !== players.me.id)
    .map((p) => players.get(p.playerId).username);
  return `You vs ${joinNames(opponents)}`;
}
