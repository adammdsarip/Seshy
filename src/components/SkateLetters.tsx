import { SKATE_WORD, lettersLabel } from '../domain/rules';
import styles from './SkateLetters.module.css';

/** The five S-K-A-T-E boxes, filled for each letter the player holds. */
export function SkateLetters({ count, compact }: { count: number; compact?: boolean }) {
  const label = count === 0 ? 'No letters' : `${count} of 5 letters: ${lettersLabel(count)}`;
  return (
    <span className={`${styles.row} ${compact ? styles.compact : ''}`} role="img" aria-label={label}>
      {SKATE_WORD.split('').map((letter, i) => (
        <span key={letter} className={`${styles.box} ${i < count ? styles.on : ''}`} aria-hidden="true">
          {letter}
        </span>
      ))}
    </span>
  );
}
