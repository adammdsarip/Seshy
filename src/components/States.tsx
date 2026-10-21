import type { ReactNode } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from './Button';
import styles from './States.module.css';

export function LoadingState({ label = 'Loading', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className="visually-hidden">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeleton} aria-hidden="true" />
      ))}
    </div>
  );
}

interface EmptyProps {
  art: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}

export function EmptyState({ art, title, body, action }: EmptyProps) {
  return (
    <div className={styles.empty}>
      <div className={styles.art}>{art}</div>
      <h2 className={`${styles.title} display`}>{title}</h2>
      <p className={styles.body}>{body}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className={`${styles.empty} ${styles.error}`} role="alert">
      <div className={styles.art}>
        <TriangleAlert size={40} aria-hidden="true" />
      </div>
      <h2 className={`${styles.title} display`}>Couldn’t load this</h2>
      <p className={styles.body}>{error.message}</p>
      <div className={styles.action}>
        <Button variant="secondary" onClick={onRetry} icon={<RefreshCw size={18} aria-hidden="true" />}>
          Try again
        </Button>
      </div>
    </div>
  );
}
