import type { GameType, Player, Standing } from '../domain/types';
import { Avatar } from './Avatar';
import { CrownIcon } from './BrandIcons';
import { SkateLetters } from './SkateLetters';
import styles from './StandingRow.module.css';

interface Props {
  standing: Standing;
  player: Player;
  gameType: GameType;
  isMe: boolean;
  /** Set when it's this player's turn, e.g. "to set a trick". */
  turnAction?: string;
}

export function StandingRow({ standing, player, gameType, isMe, turnAction }: Props) {
  const classes = [styles.row, standing.isLeader && styles.leader, isMe && styles.me, standing.eliminated && styles.out];
  return (
    <li className={classes.filter(Boolean).join(' ')}>
      <span className={`${styles.rank} display`}>
        {standing.isLeader ? (
          <>
            <CrownIcon size={24} />
            <span className="visually-hidden">Leader, rank {standing.rank}</span>
          </>
        ) : (
          <>
            <span className="visually-hidden">Rank </span>
            {standing.rank}
          </>
        )}
      </span>
      <Avatar player={player} size={40} />
      <span className={styles.who}>
        <span className={styles.name}>
          <span className={styles.nameText}>{player.username}</span>
          {isMe && <span className={styles.youTag}>You</span>}
        </span>
        {turnAction && (
          <span className={styles.turnNote}>
            <span className={styles.turnDot} aria-hidden="true" />
            Up now<span className="visually-hidden">, {turnAction}</span>
          </span>
        )}
        {standing.eliminated && <span className={styles.outNote}>Out</span>}
      </span>
      <span className={styles.progress}>
        {gameType === 'skate' ? (
          <SkateLetters count={standing.letters ?? 0} />
        ) : (
          <span className={styles.points}>
            <span className={`${styles.pointsValue} display`}>{standing.points}</span>
            <span className={styles.pointsUnit}>pts · {standing.landed} landed</span>
          </span>
        )}
      </span>
    </li>
  );
}
