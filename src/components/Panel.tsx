import type { ReactNode } from 'react';
import { Link } from 'react-router';
import styles from './Panel.module.css';

interface Props {
  title?: ReactNode;
  /** Optional "See all"-style link in the panel header. */
  action?: { to: string; label: string; ariaLabel?: string };
  children: ReactNode;
  className?: string;
  /** Use `bare` for sections that sit straight on the page background. */
  bare?: boolean;
  headingLevel?: 'h2' | 'h3';
}

export function Panel({ title, action, children, className, bare, headingLevel: H = 'h2' }: Props) {
  return (
    <section className={[styles.panel, bare && styles.bare, className].filter(Boolean).join(' ')}>
      {(title || action) && (
        <div className={styles.head}>
          {title && <H className={`${styles.title} display`}>{title}</H>}
          {action && (
            <Link to={action.to} className={styles.action} aria-label={action.ariaLabel}>
              {action.label}
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
