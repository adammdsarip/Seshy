import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import type { PlayerDirectory } from '../data/DataProvider';
import { GAME_LABELS, type MatchResult } from '../domain/types';
import { formatDate } from '../lib/format';
import { resultHeadline, viewerOutcome } from '../lib/matchText';
import { ResultSticker } from './Badges';
import { GameThumb } from './GameArt';
import styles from './MatchRow.module.css';

/** One finished match in a list. The whole row opens its details. */
export function MatchRow({ result, players, showSummary }: { result: MatchResult; players: PlayerDirectory; showSummary?: boolean }) {
  const headline = resultHeadline(result, players);
  const mine = result.placements.find((p) => p.playerId === players.me.id);
  return (
    <li>
      <Link
        to={`/play/matches/${result.matchId}`}
        className={styles.row}
        aria-label={`${headline}, ${GAME_LABELS[result.gameType]}, ${formatDate(result.endedAt)}. View match details`}
      >
        <GameThumb game={result.gameType} size={52} />
        <span className={styles.text}>
          <span className={styles.title}>{headline}</span>
          <span className={styles.meta}>
            {GAME_LABELS[result.gameType]} · {formatDate(result.endedAt)}
          </span>
          {showSummary && mine && result.status === 'completed' && (
            <span className={styles.meta}>
              You finished #{mine.place} · <span className={styles.nowrap}>{mine.summary}</span>
            </span>
          )}
        </span>
        <ResultSticker outcome={viewerOutcome(result, players.me.id)} />
        <ChevronRight size={18} className={styles.chevron} aria-hidden="true" />
      </Link>
    </li>
  );
}
