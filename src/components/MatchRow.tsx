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
  const outcome = viewerOutcome(result, players.me.id);
  const mine = result.placements.find((p) => p.playerId === players.me.id);
  const outcomeWord = { win: 'Won', loss: 'Lost', draw: 'Drew', abandoned: 'Abandoned' }[outcome];
  return (
    <li>
      <Link
        to={`/play/matches/${result.matchId}`}
        className={styles.row}
        aria-label={`${outcomeWord}: ${headline}, ${GAME_LABELS[result.gameType]}, ${formatDate(result.endedAt)}. View match details`}
      >
        <GameThumb game={result.gameType} size={44} />
        <span className={styles.text}>
          <span className={styles.title}>{headline}</span>
          <span className={styles.meta}>
            {GAME_LABELS[result.gameType]} · {formatDate(result.endedAt)}
          </span>
          {showSummary && mine && result.status === 'completed' && (
            <span className={styles.meta}>
              Finished #{mine.place} · <span className={styles.nowrap}>{mine.summary}</span>
            </span>
          )}
        </span>
        <ResultSticker outcome={outcome} />
        <ChevronRight size={18} className={styles.chevron} aria-hidden="true" />
      </Link>
    </li>
  );
}
