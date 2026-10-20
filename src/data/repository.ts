import type { Match, MatchResult, Player } from '../domain/types';

/**
 * Everything the UI reads goes through this interface. The current
 * implementation is sample data (./sample); a real backend implementation
 * will replace it without the screens changing.
 *
 * Friends-only by design: there is deliberately no way to search or list
 * users who aren't the viewer's accepted friends.
 */
export interface SeshyRepository {
  /** `sample` sources are flagged throughout the UI. */
  readonly source: 'sample' | 'remote';
  getCurrentUser(): Promise<Player>;
  /** Accepted friends only. Pending or declined requests are never returned. */
  listFriends(): Promise<Player[]>;
  /** The viewer's in-progress match, if any. */
  getActiveMatch(): Promise<Match | null>;
  getMatch(matchId: string): Promise<Match | null>;
  /** Finished (completed or abandoned) matches the viewer took part in, newest first. */
  listMatchResults(): Promise<MatchResult[]>;
}
