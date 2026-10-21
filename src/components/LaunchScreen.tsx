import { useEffect } from 'react';
import { Logo } from './Logo';
import { SkateparkBackdrop } from './SkateparkBackdrop';
import styles from './LaunchScreen.module.css';

/**
 * Launch screen: the brush logo on the atmospheric skatepark, and nothing
 * else: no text, fields or buttons. It hands over to the app by itself.
 */
export function LaunchScreen({ onDone, durationMs = 1800 }: { onDone: () => void; durationMs?: number }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(timer);
  }, [onDone, durationMs]);

  return (
    <div className={styles.launch}>
      <SkateparkBackdrop variant="launch" />
      <div className={styles.logo}>
        <Logo width="min(84vw, 460px)" />
      </div>
    </div>
  );
}
