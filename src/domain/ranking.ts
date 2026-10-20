import type { GameType, MatchResult, Player } from './types';
import { competitionRanks } from './rules/ranks';

export interface RankingRow {
  playerId: string;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  played: number;
  /** wins / played, or null when the player hasn't finished a match yet. */
  winRate: number | null;
}

/**
 * Friends Ranking: the viewer plus their accepted friends — never a global
 * leaderboard.
 *
 * Only completed matches count; in-progress and abandoned matches are
 * ignored. Order:
 *   1. most wins
 *   2. higher win rate (players with no completed matches come last)
 *   3. remaining ties share a rank and are listed alphabetically by username
 */
export function computeFriendsRanking(
  results: MatchResult[],
  members: Player[],
  gameType?: GameType,
): RankingRow[] {
  const memberIds = new Set(members.map((m) => m.id));
  const tally = new Map(members.map((m) => [m.id, { wins: 0, losses: 0, draws: 0 }]));

  for (const result of results) {
    if (result.status !== 'completed') continue;
    if (gameType && result.gameType !== gameType) continue;
    for (const placement of result.placements) {
      if (!memberIds.has(placement.playerId)) continue;
      const row = tally.get(placement.playerId)!;
      if (placement.outcome === 'win') row.wins++;
      else if (placement.outcome === 'loss') row.losses++;
      else row.draws++;
    }
  }

  const username = new Map(members.map((m) => [m.id, m.username]));
  const rows = [...tally].map(([playerId, t]) => {
    const played = t.wins + t.losses + t.draws;
    return { playerId, ...t, played, winRate: played === 0 ? null : t.wins / played, rank: 0 };
  });

  const rate = (r: RankingRow) => r.winRate ?? -1;
  rows.sort(
    (a, b) =>
      b.wins - a.wins ||
      rate(b) - rate(a) ||
      username.get(a.playerId)!.localeCompare(username.get(b.playerId)!) ||
      a.playerId.localeCompare(b.playerId),
  );
  const ranks = competitionRanks(rows, (a, b) => a.wins === b.wins && rate(a) === rate(b));
  return rows.map((row, i) => ({ ...row, rank: ranks[i]! }));
}

export function formatWinRate(winRate: number | null): string {
  return winRate === null ? '—' : `${Math.round(winRate * 100)}%`;
}
