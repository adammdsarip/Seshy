import type { PlayerDirectory } from '../data/DataProvider';
import type { MatchResult, Outcome } from '../domain/types';
import { joinNames } from './format';

export type ViewerOutcome = Outcome | 'abandoned';

export function viewerOutcome(result: MatchResult, viewerId: string): ViewerOutcome {
  if (result.status === 'abandoned') return 'abandoned';
  return result.placements.find((p) => p.playerId === viewerId)?.outcome ?? 'loss';
}

const VERB: Record<ViewerOutcome, string> = { win: 'Won', loss: 'Lost', draw: 'Drew', abandoned: 'Abandoned' };

/** "Won vs Alex", "Lost vs Jay & Mia". */
export function resultHeadline(result: MatchResult, players: PlayerDirectory): string {
  const opponents = result.placements
    .filter((p) => p.playerId !== players.me.id)
    .map((p) => players.get(p.playerId).username);
  return `${VERB[viewerOutcome(result, players.me.id)]} vs ${joinNames(opponents)}`;
}
