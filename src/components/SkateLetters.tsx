import { SKATE_WORD, lettersLabel } from '../domain/rules';
import styles from './SkateLetters.module.css';

/** The five S-K-A-T-E circles, filled for each letter the player holds. */
export function SkateLetters({ count, size = 'md' }: { count: number; size?: 'md' | 'lg' }) {
  const label = count === 0 ? 'No letters' : `${count} of 5 letters: ${lettersLabel(count)}`;
  return (
    <span className={`${styles.row} ${styles[size]}`} role="img" aria-label={label}>
      {SKATE_WORD.split('').map((letter, i) => (
        <span key={letter} className={`${styles.dot} ${i < count ? styles.on : ''}`} aria-hidden="true">
          {letter}
        </span>
      ))}
    </span>
  );
}
