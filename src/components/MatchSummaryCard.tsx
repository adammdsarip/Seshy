import type { ReactNode } from 'react';
import { MapPin, Smartphone, Wifi } from 'lucide-react';
import { GAME_LABELS, type Match } from '../domain/types';
import { formatDateTime, timeAgo } from '../lib/format';
import { StatusPill } from './Badges';
import { GameThumb } from './GameArt';
import styles from './MatchSummaryCard.module.css';

/** Game, place, time, status and mode for one match. */
export function MatchSummaryCard({ match, children, headingLevel: H = 'h2' }: { match: Match; children?: ReactNode; headingLevel?: 'h2' | 'h3' }) {
  const live = match.status === 'in-progress';
  return (
    <div className={`${styles.card} ${live ? styles.live : ''}`}>
      <div className={styles.top}>
        <GameThumb game={match.gameType} size={52} />
        <div className={styles.text}>
          <H className={`${styles.title} display`}>{GAME_LABELS[match.gameType]}</H>
          {match.location && (
            <p className={styles.meta}>
              <MapPin size={13} aria-hidden="true" /> {match.location}
            </p>
          )}
          <p className={styles.meta}>
            {live ? `Started ${timeAgo(match.startedAt)}` : formatDateTime(match.startedAt)} · {match.playerIds.length} players
          </p>
        </div>
        <StatusPill status={match.status} />
      </div>
      <div className={styles.chips}>
        <span className={styles.chip}>
          {match.mode === 'pass-and-play' ? <Smartphone size={13} aria-hidden="true" /> : <Wifi size={13} aria-hidden="true" />}
          {match.mode === 'pass-and-play' ? 'Pass & play' : 'Online'}
        </span>
        {match.gameType === 'skate-dice' && <span className={styles.chip}>{match.rounds} rounds</span>}
      </div>
      {children}
    </div>
  );
}
