/**
 * Core Seshy domain types.
 *
 * Everything here is transport-agnostic: a pass-and-play match on one phone
 * and an online match across several phones share the same match shape, the
 * same event log, the same rules (see ./rules) and the same MatchResult.
 */

export type GameType = 'skate' | 'skate-dice';

/** How the match is being played. Rules and results are identical in both. */
export type MatchMode = 'pass-and-play' | 'online';

export type MatchStatus = 'in-progress' | 'completed' | 'abandoned';

export type AvatarTone = 'lime' | 'orange' | 'purple' | 'offwhite';

export interface Player {
  id: string;
  username: string;
  avatarTone: AvatarTone;
}

/** One attempt in a Game of S.K.A.T.E. */
export interface SkateAttempt {
  id: string;
  at: string; // ISO timestamp
  playerId: string;
  trick: string;
  landed: boolean;
  /** `set`: the setter calls a trick. `match`: a player copies the set trick. */
  role: 'set' | 'match';
}

/** Trick difficulty rolled by the dice. A landed trick scores its difficulty. */
export type DiceDifficulty = 1 | 2 | 3;

/** One roll-and-attempt in Skate Dice. */
export interface DiceAttempt {
  id: string;
  at: string;
  playerId: string;
  trick: string;
  difficulty: DiceDifficulty;
  landed: boolean;
}

interface MatchBase {
  id: string;
  mode: MatchMode;
  status: MatchStatus;
  location?: string;
  startedAt: string;
  endedAt?: string;
  /** Turn order. */
  playerIds: string[];
}

export interface SkateMatch extends MatchBase {
  gameType: 'skate';
  events: SkateAttempt[];
}

export interface DiceMatch extends MatchBase {
  gameType: 'skate-dice';
  /** Every player gets one roll per round. */
  rounds: number;
  events: DiceAttempt[];
}

export type Match = SkateMatch | DiceMatch;

/** A player's position in a match, ready to render. */
export interface Standing {
  playerId: string;
  /** Competition ranking: tied players share a rank (1, 2, 2, 4). */
  rank: number;
  isLeader: boolean;
  eliminated: boolean;
  /** Short game-specific progress, e.g. "S-K-A" or "7 pts". */
  progressLabel: string;
  /** Game of S.K.A.T.E. only. */
  letters?: number;
  /** Skate Dice only. */
  points?: number;
  landed?: number;
}

export interface TurnStatus {
  playerId: string;
  /** e.g. "to set a trick", "to match Kickflip", "to roll". */
  action: string;
}

export interface MatchSnapshot {
  standings: Standing[];
  turn: TurnStatus | null;
  finished: boolean;
  /** null while unfinished, or when the match ends in a draw. */
  winnerId: string | null;
  /** e.g. "Round 3 of 5". */
  progressNote?: string;
}

export type Outcome = 'win' | 'loss' | 'draw';

/**
 * The standard result every finished match produces, whatever the game type
 * or mode. Rankings and history are built from these alone.
 */
export interface MatchResult {
  matchId: string;
  gameType: GameType;
  mode: MatchMode;
  status: 'completed' | 'abandoned';
  location?: string;
  startedAt: string;
  endedAt: string;
  winnerId: string | null;
  placements: Array<{
    playerId: string;
    place: number;
    outcome: Outcome;
    summary: string;
  }>;
}

export const GAME_LABELS: Record<GameType, string> = {
  skate: 'Game of S.K.A.T.E.',
  'skate-dice': 'Skate Dice',
};
