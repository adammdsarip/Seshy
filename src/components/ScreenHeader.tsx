import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';
import styles from './ScreenHeader.module.css';

interface Props {
  title: ReactNode;
  /** Where the back button goes. Omit on top-level screens. */
  backTo?: string;
  backLabel?: string;
  /** Icon buttons or links on the right, e.g. settings. */
  actions?: ReactNode;
}

export function ScreenHeader({ title, backTo, backLabel = 'Back', actions }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.side}>
        {backTo && (
          <Link to={backTo} className={styles.iconButton} aria-label={backLabel}>
            <ChevronLeft size={26} aria-hidden="true" />
          </Link>
        )}
      </div>
      <h1 className={`${styles.title} display`}>{title}</h1>
      <div className={`${styles.side} ${styles.right}`}>{actions}</div>
    </header>
  );
}

/** Round icon-only link for ScreenHeader `actions`. */
export function HeaderAction({ to, label, children }: { to: string; label: string; children: ReactNode }) {
  return (
    <Link to={to} className={styles.iconButton} aria-label={label}>
      {children}
    </Link>
  );
}
