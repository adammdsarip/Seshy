import type { MatchStatus } from '../domain/types';
import type { ViewerOutcome } from '../lib/matchText';
import styles from './Badges.module.css';

const STATUS: Record<MatchStatus, { label: string; cls: string }> = {
  'in-progress': { label: 'Live', cls: styles.live! },
  completed: { label: 'Completed', cls: styles.completed! },
  abandoned: { label: 'Abandoned', cls: styles.abandoned! },
};

export function StatusPill({ status }: { status: MatchStatus }) {
  const s = STATUS[status];
  return (
    <span className={`${styles.pill} ${s.cls}`}>
      {status === 'in-progress' && <span className={styles.dot} aria-hidden="true" />}
      {s.label}
    </span>
  );
}

const RESULT: Record<ViewerOutcome, { label: string; cls: string }> = {
  win: { label: 'Win', cls: styles.win! },
  loss: { label: 'Lose', cls: styles.loss! },
  draw: { label: 'Draw', cls: styles.draw! },
  abandoned: { label: 'Void', cls: styles.void! },
};

/** Tilted WIN / LOSE sticker from the reference design. */
export function ResultSticker({ outcome }: { outcome: ViewerOutcome }) {
  const r = RESULT[outcome];
  return <span className={`${styles.sticker} ${r.cls} marker`}>{r.label}</span>;
}

export function SampleTag() {
  return (
    <span className={styles.sampleTag} title="Fictional data for the Phase 1 UI preview">
      Sample
    </span>
  );
}
