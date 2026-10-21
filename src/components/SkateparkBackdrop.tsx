import type { CSSProperties } from 'react';
import skatepark from '../assets/backgrounds/skatepark.webp';
import styles from './SkateparkBackdrop.module.css';

/**
 * The skatepark-at-sunset photo behind the app. `launch` shows it at full
 * strength; `app` fades it right back so it never competes with content.
 * It's decorative and sits behind everything.
 */
export function SkateparkBackdrop({ variant = 'app' }: { variant?: 'app' | 'launch' }) {
  return (
    <div
      className={`${styles.backdrop} ${styles[variant]}`}
      style={{ '--photo': `url(${skatepark})` } as CSSProperties}
      aria-hidden="true"
    >
      <div className={styles.photo} />
      <div className={styles.shade} />
    </div>
  );
}
