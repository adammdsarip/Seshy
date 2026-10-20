import { SKATE_WORD } from '../domain/rules';
import { pointsLabel } from '../domain/rules/skateDice';
import type { Match } from '../domain/types';

export interface LogEntry {
  id: string;
  at: string;
  playerId: string | null;
  text: string;
  tone: 'landed' | 'missed' | 'neutral';
}

/** Human-readable game log, newest first. */
export function buildGameLog(match: Match, nameOf: (id: string) => string): LogEntry[] {
  const entries: LogEntry[] = [
    { id: `${match.id}-start`, at: match.startedAt, playerId: null, text: 'Match started', tone: 'neutral' },
  ];

  if (match.gameType === 'skate') {
    const letters: Record<string, number> = {};
    for (const e of match.events) {
      const name = nameOf(e.playerId);
      let text: string;
      if (e.role === 'set') {
        text = e.landed ? `${name} set ${e.trick}` : `${name} missed the set (${e.trick})`;
      } else if (e.landed) {
        text = `${name} matched ${e.trick}`;
      } else {
        letters[e.playerId] = (letters[e.playerId] ?? 0) + 1;
        text = `${name} missed ${e.trick} — gets ${SKATE_WORD[letters[e.playerId]! - 1]}`;
      }
      entries.push({ id: e.id, at: e.at, playerId: e.playerId, text, tone: e.landed ? 'landed' : 'missed' });
    }
  } else {
    for (const e of match.events) {
      const name = nameOf(e.playerId);
      entries.push({
        id: e.id,
        at: e.at,
        playerId: e.playerId,
        text: e.landed ? `${name} landed ${e.trick} (+${pointsLabel(e.difficulty)})` : `${name} missed ${e.trick}`,
        tone: e.landed ? 'landed' : 'missed',
      });
    }
  }

  if (match.status !== 'in-progress') {
    entries.push({
      id: `${match.id}-end`,
      at: match.endedAt ?? match.events.at(-1)?.at ?? match.startedAt,
      playerId: null,
      text: match.status === 'completed' ? 'Match finished' : 'Match abandoned',
      tone: 'neutral',
    });
  }

  return entries.reverse();
}
