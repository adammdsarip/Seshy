import { NavLink } from 'react-router';
import styles from './Tabs.module.css';

/** Segmented control where each segment is a route. */
export function RouteTabs({ tabs, label }: { tabs: Array<{ to: string; label: string }>; label: string }) {
  return (
    <nav className={styles.tabs} aria-label={label}>
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

/** Same look as RouteTabs, for filters held in component or URL state. */
export function ChoiceTabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className={styles.tabs} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          className={`${styles.tab} ${styles.button} ${o.value === value ? styles.active : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
