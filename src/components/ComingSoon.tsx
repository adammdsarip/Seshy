import type { ReactNode } from 'react';
import { Hammer } from 'lucide-react';
import styles from './ComingSoon.module.css';

/** Honest placeholder for features that aren't built yet. */
export function ComingSoon({ title, children, planned }: { title: string; children: ReactNode; planned: string[] }) {
  return (
    <section className={styles.card} aria-labelledby="coming-soon-title">
      <span className={styles.badge}>
        <Hammer size={14} aria-hidden="true" /> Coming soon
      </span>
      <h2 id="coming-soon-title" className={`${styles.title} display`}>
        {title}
      </h2>
      <p className={styles.body}>{children}</p>
      <h3 className={styles.plannedHeading}>Planned</h3>
      <ul className={styles.list}>
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
