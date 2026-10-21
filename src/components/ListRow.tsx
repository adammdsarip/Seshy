import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import styles from './ListRow.module.css';

interface Props {
  icon: ReactNode;
  label: string;
  /** Right-aligned detail, e.g. "Dark" or "4 friends". */
  value?: string;
  /** A link row. Omit for a row that isn't available yet. */
  to?: string;
  /** Shown instead of a chevron when the row has no destination yet. */
  soon?: boolean;
}

/** One row in a grouped list (Profile shortcuts, Settings). */
export function ListRow({ icon, label, value, to, soon }: Props) {
  const body = (
    <>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
      {value && <span className={styles.value}>{value}</span>}
      {soon ? <span className={styles.soon}>Soon</span> : to ? <ChevronRight size={18} className={styles.chevron} aria-hidden="true" /> : null}
    </>
  );
  return to ? (
    <Link to={to} className={styles.row}>
      {body}
    </Link>
  ) : (
    <div className={`${styles.row} ${soon ? styles.unavailable : ''}`} aria-disabled={soon || undefined}>
      {body}
    </div>
  );
}

export function ListGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className={styles.group}>
      {title && <h2 className={styles.groupTitle}>{title}</h2>}
      <div className={styles.card}>{children}</div>
    </section>
  );
}
