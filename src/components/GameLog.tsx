import { useState } from 'react';
import { Flag } from 'lucide-react';
import type { PlayerDirectory } from '../data/DataProvider';
import type { Match } from '../domain/types';
import { formatDateTime, timeAgo } from '../lib/format';
import { buildGameLog } from '../lib/gameLog';
import { Avatar } from './Avatar';
import { Button } from './Button';
import styles from './GameLog.module.css';

const PREVIEW = 12;

/** Newest-first log of every attempt, collapsed to the latest few until expanded. */
export function GameLog({ match, players }: { match: Match; players: PlayerDirectory }) {
  const [showAll, setShowAll] = useState(false);
  const live = match.status === 'in-progress';
  const log = buildGameLog(match, (id) => players.get(id).username);
  const visible = showAll ? log : log.slice(0, PREVIEW);

  return (
    <div>
      <ol className={`list-reset ${styles.log}`} id={`game-log-${match.id}`}>
        {visible.map((entry) => (
          <li key={entry.id} className={`${styles.item} ${styles[entry.tone]}`}>
            {entry.playerId ? (
              <Avatar player={players.get(entry.playerId)} size={28} />
            ) : (
              <span className={styles.icon} aria-hidden="true">
                <Flag size={15} />
              </span>
            )}
            <span className={styles.text}>{entry.text}</span>
            <time className={styles.time} dateTime={entry.at}>
              {live ? timeAgo(entry.at) : formatDateTime(entry.at).split(' · ')[1]}
            </time>
          </li>
        ))}
      </ol>
      {log.length > PREVIEW && (
        <Button
          variant="ghost"
          block
          aria-controls={`game-log-${match.id}`}
          aria-expanded={showAll}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? 'Show latest only' : `Show full log (${log.length} entries)`}
        </Button>
      )}
    </div>
  );
}
