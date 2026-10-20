import { describe, expect, it } from 'vitest';
import { snapshotMatch, toMatchResult } from '../../domain/rules';
import { buildSampleMatches } from './fixtures';

describe('sample fixtures', () => {
  const { active, finished } = buildSampleMatches(new Date('2026-10-20T12:00:00Z'));

  it('has a live, unfinished match', () => {
    expect(active.status).toBe('in-progress');
    expect(snapshotMatch(active).finished).toBe(false);
  });

  it('only marks matches completed when the rules agree they finished', () => {
    for (const match of finished) {
      const snap = snapshotMatch(match);
      if (match.status === 'completed') expect(snap.finished).toBe(true);
      expect(() => toMatchResult(match)).not.toThrow();
    }
  });
});
