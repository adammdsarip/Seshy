import type { Player } from '../domain/types';
import styles from './Avatar.module.css';

/** Initials avatar. Decorative — the username is always shown beside it. */
export function Avatar({ player, size = 40 }: { player: Player; size?: number }) {
  const initials = player.username === 'You' ? 'ME' : player.username.slice(0, 2).toUpperCase();
  return (
    <span
      className={`${styles.avatar} ${styles[player.avatarTone]}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
