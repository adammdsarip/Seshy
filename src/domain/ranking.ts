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

export interface RankingFilter {
  gameType?: GameType;
  /** Only count matches that ended on or after this moment (e.g. start of the month). */
  since?: Date;
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
  { gameType, since }: RankingFilter = {},
): RankingRow[] {
  const memberIds = new Set(members.map((m) => m.id));
  const tally = new Map(members.map((m) => [m.id, { wins: 0, losses: 0, draws: 0 }]));

  for (const result of results) {
    if (result.status !== 'completed') continue;
    if (gameType && result.gameType !== gameType) continue;
    if (since && new Date(result.endedAt) < since) continue;
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

export function startOfMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * The player's current run of consecutive wins, newest match first.
 * Abandoned matches are skipped (they don't count); a loss or draw ends the run.
 */
export function currentWinStreak(results: MatchResult[], playerId: string): number {
  const mine = results
    .filter((r) => r.status === 'completed' && r.placements.some((p) => p.playerId === playerId))
    .sort((a, b) => b.endedAt.localeCompare(a.endedAt));
  let streak = 0;
  for (const r of mine) {
    if (r.placements.find((p) => p.playerId === playerId)?.outcome !== 'win') break;
    streak++;
  }
  return streak;
}
