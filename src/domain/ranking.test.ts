import { describe, expect, it } from 'vitest';
import { computeFriendsRanking, currentWinStreak, formatWinRate, startOfMonth } from './ranking';
import type { MatchResult, Player } from './types';

const members: Player[] = ['me', 'jay', 'alex', 'mia', 'zed'].map((id) => ({
  id,
  username: id[0]!.toUpperCase() + id.slice(1),
  avatarTone: 'volt',
}));

let n = 0;
function result(winner: string, losers: string[], extra: Partial<MatchResult> = {}): MatchResult {
  return {
    matchId: `m${++n}`,
    gameType: 'skate',
    mode: 'pass-and-play',
    status: 'completed',
    startedAt: '2026-01-01',
    endedAt: '2026-01-01',
    winnerId: winner,
    placements: [
      { playerId: winner, place: 1, outcome: 'win', summary: '' },
      ...losers.map((id, i) => ({ playerId: id, place: i + 2, outcome: 'loss' as const, summary: '' })),
    ],
    ...extra,
  };
}

describe('computeFriendsRanking', () => {
  it('sorts by wins, then win rate, then name — and ties share a rank', () => {
    const rows = computeFriendsRanking(
      [
        result('jay', ['me']),
        result('jay', ['alex']),
        result('me', ['alex']),
        result('me', ['mia']),
        result('alex', ['mia']),
        result('mia', ['jay']),
      ],
      members,
    );
    // jay 2-1, me 2-1 → tied on wins and win rate: share rank 1, listed by name.
    expect(rows.map((r) => [r.playerId, r.rank, r.wins, r.losses])).toEqual([
      ['jay', 1, 2, 1],
      ['me', 1, 2, 1],
      ['alex', 3, 1, 2],
      ['mia', 3, 1, 2],
      ['zed', 5, 0, 0],
    ]);
    expect(rows.at(-1)!.winRate).toBeNull();
  });

  it('uses win rate as the tiebreaker on equal wins', () => {
    const rows = computeFriendsRanking(
      [result('jay', ['me']), result('me', ['jay']), result('alex', ['me']), result('jay', ['mia'])].concat(
        result('alex', ['jay']),
      ),
      members,
    );
    // jay 2W/2L (50%), alex 2W/0L (100%) → alex first.
    expect(rows.slice(0, 2).map((r) => r.playerId)).toEqual(['alex', 'jay']);
  });

  it('ignores abandoned matches and non-friends', () => {
    const rows = computeFriendsRanking(
      [result('jay', ['me'], { status: 'abandoned' }), result('stranger', ['me'])],
      members,
    );
    expect(rows.find((r) => r.playerId === 'jay')!.wins).toBe(0);
    expect(rows.find((r) => r.playerId === 'me')!.losses).toBe(1);
    expect(rows.some((r) => r.playerId === 'stranger')).toBe(false);
  });

  it('filters by game type', () => {
    const rows = computeFriendsRanking(
      [result('jay', ['me']), result('me', ['jay'], { gameType: 'skate-dice' })],
      members,
      { gameType: 'skate-dice' },
    );
    expect(rows[0]).toMatchObject({ playerId: 'me', wins: 1 });
    expect(rows.find((r) => r.playerId === 'jay')).toMatchObject({ wins: 0, losses: 1 });
  });

  it('can be limited to a period', () => {
    const rows = computeFriendsRanking(
      [
        result('jay', ['me'], { endedAt: '2026-09-30T12:00:00Z' }),
        result('me', ['jay'], { endedAt: '2026-10-02T12:00:00Z' }),
      ],
      members,
      { since: startOfMonth(new Date('2026-10-20T12:00:00Z')) },
    );
    expect(rows.find((r) => r.playerId === 'jay')).toMatchObject({ wins: 0, losses: 1 });
    expect(rows[0]).toMatchObject({ playerId: 'me', wins: 1 });
  });

  it('formats win rate', () => {
    expect(formatWinRate(null)).toBe('—');
    expect(formatWinRate(2 / 3)).toBe('67%');
  });
});

describe('currentWinStreak', () => {
  const at = (d: number) => `2026-10-${String(d).padStart(2, '0')}T12:00:00Z`;

  it('counts consecutive wins from the newest match, skipping abandoned ones', () => {
    const results = [
      result('me', ['jay'], { endedAt: at(10) }),
      result('jay', ['me'], { endedAt: at(11) }),
      result('me', ['jay'], { endedAt: at(12) }),
      result('jay', ['me'], { endedAt: at(13), status: 'abandoned' }),
      result('me', ['alex'], { endedAt: at(14) }),
    ];
    expect(currentWinStreak(results, 'me')).toBe(2);
  });

  it('is zero when the latest match was lost or there are none', () => {
    expect(currentWinStreak([result('jay', ['me'], { endedAt: at(10) })], 'me')).toBe(0);
    expect(currentWinStreak([], 'me')).toBe(0);
  });
});
