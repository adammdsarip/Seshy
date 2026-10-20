import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';
import styles from './ScreenHeader.module.css';

interface Props {
  title: ReactNode;
  /** Where the back button goes. Omit on top-level screens. */
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}

export function ScreenHeader({ title, backTo, backLabel = 'Back', actions, eyebrow }: Props) {
  return (
    <header className={styles.header}>
      {backTo && (
        <Link to={backTo} className={styles.back} aria-label={backLabel}>
          <ChevronLeft size={26} aria-hidden="true" />
        </Link>
      )}
      <div className={styles.titles}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={`${styles.title} display`}>{title}</h1>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
