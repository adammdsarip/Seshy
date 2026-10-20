import { CrownSticker } from './Stickers';
import styles from './Logo.module.css';

export function Logo({ size = 'md', tagline = false }: { size?: 'sm' | 'md' | 'lg'; tagline?: boolean }) {
  return (
    <div className={`${styles.logo} ${styles[size]}`}>
      <span className={styles.wordmark}>
        <CrownSticker className={styles.crown} size={size === 'lg' ? 34 : 22} color="var(--orange)" />
        <span className="marker">Seshy</span>
        <sup aria-hidden="true">®</sup>
      </span>
      {tagline && (
        <p className={`${styles.tagline} marker`}>
          Good friends.
          <br />
          Good sessions.
        </p>
      )}
    </div>
  );
}
