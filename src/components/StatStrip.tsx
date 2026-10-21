import type { ReactNode } from 'react';
import styles from './StatStrip.module.css';

export interface Stat {
  icon?: ReactNode;
  value: string | number;
  label: string;
  tone?: 'volt' | 'cyan' | 'coral' | 'white';
}

/** A compact row of 2–4 headline numbers. */
export function StatStrip({ stats, label, compact }: { stats: Stat[]; label: string; compact?: boolean }) {
  return (
    <div role="group" aria-label={label}>
      <dl className={`${styles.strip} ${compact ? styles.compact : ''}`}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            {s.icon && <span className={`${styles.icon} ${styles[s.tone ?? 'white']}`}>{s.icon}</span>}
            <dd className={`${styles.value} display`}>{s.value}</dd>
            <dt className={styles.label}>{s.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
