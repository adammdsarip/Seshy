import { describe, expect, it } from 'vitest';
import type { DiceAttempt, Match, SkateAttempt } from '../types';
import { InvalidMoveError, deriveDice, deriveSkate, lettersLabel, snapshotMatch, toMatchResult } from './index';

let n = 0;
const skate = (playerId: string, role: 'set' | 'match', landed: boolean, trick = 'Kickflip'): SkateAttempt => ({
  id: `e${++n}`,
  at: new Date(2026, 0, 1, 12, n).toISOString(),
  playerId,
  role,
  landed,
  trick,
});
const dice = (playerId: string, difficulty: 1 | 2 | 3, landed: boolean): DiceAttempt => ({
  id: `d${++n}`,
  at: new Date(2026, 0, 1, 12, n).toISOString(),
  playerId,
  trick: 'Kickflip',
  difficulty,
  landed,
});

describe('Game of S.K.A.T.E.', () => {
  it('formats letters', () => {
    expect(lettersLabel(0)).toBe('');
    expect(lettersLabel(3)).toBe('S-K-A');
    expect(lettersLabel(5)).toBe('S-K-A-T-E');
  });

  it('gives a letter to a player who fails to match, and the setter keeps setting', () => {
    const state = deriveSkate({
      playerIds: ['a', 'b', 'c'],
      events: [skate('a', 'set', true), skate('b', 'match', false), skate('c', 'match', true)],
    });
    expect(state.letters).toEqual({ a: 0, b: 1, c: 0 });
    expect(state.turn).toMatchObject({ playerId: 'a', role: 'set' });
  });

  it('passes the set to the next player when the setter misses', () => {
    const state = deriveSkate({ playerIds: ['a', 'b'], events: [skate('a', 'set', false)] });
    expect(state.turn).toMatchObject({ playerId: 'b', role: 'set' });
  });

  it('asks the next player to match the set trick', () => {
    const state = deriveSkate({ playerIds: ['a', 'b', 'c'], events: [skate('a', 'set', true, 'Heelflip')] });
    expect(state.turn).toMatchObject({ playerId: 'b', role: 'match', action: 'to match Heelflip' });
  });

  it('eliminates at five letters, skips eliminated players and ends with one left', () => {
    const events: SkateAttempt[] = [];
    for (let i = 0; i < 5; i++) events.push(skate('a', 'set', true), skate('b', 'match', false), skate('c', 'match', true));
    let state = deriveSkate({ playerIds: ['a', 'b', 'c'], events });
    expect(state.letters.b).toBe(5);
    expect(state.finished).toBe(false);
    // b is out, so only c has to match from now on.
    events.push(skate('a', 'set', true));
    state = deriveSkate({ playerIds: ['a', 'b', 'c'], events });
    expect(state.turn?.playerId).toBe('c');
    for (let i = 0; i < 5; i++) {
      if (i > 0) events.push(skate('a', 'set', true));
      events.push(skate('c', 'match', false));
    }
    state = deriveSkate({ playerIds: ['a', 'b', 'c'], events });
    expect(state.finished).toBe(true);
    expect(state.winnerId).toBe('a');
    expect(state.turn).toBeNull();
  });

  it('rejects out-of-turn attempts', () => {
    expect(() => deriveSkate({ playerIds: ['a', 'b'], events: [skate('b', 'set', true)] })).toThrow(InvalidMoveError);
    expect(() =>
      deriveSkate({ playerIds: ['a', 'b'], events: [skate('a', 'set', true), skate('a', 'set', true)] }),
    ).toThrow(InvalidMoveError);
  });

  it('ranks by fewest letters, with ties sharing a rank', () => {
    const snap = snapshotMatch({
      id: 'm',
      gameType: 'skate',
      mode: 'pass-and-play',
      status: 'in-progress',
      startedAt: '',
      playerIds: ['a', 'b', 'c'],
      events: [skate('a', 'set', true), skate('b', 'match', false), skate('c', 'match', true)],
    });
    expect(snap.standings.map((s) => [s.playerId, s.rank, s.progressLabel])).toEqual([
      ['a', 1, 'No letters'],
      ['c', 1, 'No letters'],
      ['b', 3, 'S'],
    ]);
    expect(snap.standings.filter((s) => s.isLeader).map((s) => s.playerId)).toEqual(['a', 'c']);
  });
});

describe('Skate Dice', () => {
  it('scores difficulty for landed tricks and tracks rounds', () => {
    const state = deriveDice({
      playerIds: ['a', 'b'],
      rounds: 2,
      events: [dice('a', 3, true), dice('b', 2, false), dice('a', 1, true)],
    });
    expect(state.points).toEqual({ a: 4, b: 0 });
    expect(state.round).toBe(2);
    expect(state.nextPlayerId).toBe('b');
    expect(state.finished).toBe(false);
  });

  it('breaks points ties on landed tricks, otherwise draws', () => {
    const tieBroken = deriveDice({
      playerIds: ['a', 'b'],
      rounds: 2,
      events: [dice('a', 2, true), dice('b', 1, true), dice('a', 1, false), dice('b', 1, true)],
    });
    expect(tieBroken.winnerId).toBe('b');

    const draw = deriveDice({ playerIds: ['a', 'b'], rounds: 1, events: [dice('a', 2, true), dice('b', 2, true)] });
    expect(draw.finished).toBe(true);
    expect(draw.winnerId).toBeNull();
  });

  it('rejects rolls out of turn', () => {
    expect(() => deriveDice({ playerIds: ['a', 'b'], rounds: 1, events: [dice('b', 1, true)] })).toThrow(InvalidMoveError);
  });
});

describe('toMatchResult', () => {
  const base = { mode: 'online' as const, startedAt: '2026-01-01T12:00:00.000Z', playerIds: ['a', 'b'] };

  it('produces the same result format for every game', () => {
    const skateMatch: Match = {
      ...base,
      id: 's',
      gameType: 'skate',
      status: 'completed',
      events: Array.from({ length: 5 }, () => [skate('a', 'set', true), skate('b', 'match', false)]).flat(),
    };
    const diceMatch: Match = {
      ...base,
      id: 'd',
      gameType: 'skate-dice',
      status: 'completed',
      rounds: 1,
      events: [dice('a', 1, true), dice('b', 3, true)],
    };
    expect(toMatchResult(skateMatch)).toMatchObject({
      matchId: 's',
      winnerId: 'a',
      placements: [
        { playerId: 'a', place: 1, outcome: 'win' },
        { playerId: 'b', place: 2, outcome: 'loss', summary: 'S-K-A-T-E' },
      ],
    });
    expect(toMatchResult(diceMatch)).toMatchObject({
      winnerId: 'b',
      placements: [
        { playerId: 'b', outcome: 'win', summary: '3 pts' },
        { playerId: 'a', outcome: 'loss', summary: '1 pt' },
      ],
    });
  });

  it('gives abandoned matches no winner', () => {
    const result = toMatchResult({ ...base, id: 'x', gameType: 'skate', status: 'abandoned', events: [] });
    expect(result.winnerId).toBeNull();
    expect(result.status).toBe('abandoned');
  });

  it('refuses in-progress matches', () => {
    expect(() => toMatchResult({ ...base, id: 'x', gameType: 'skate', status: 'in-progress', events: [] })).toThrow();
  });
});
