import { BookOpen, House, Shuffle, Trophy, User, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router';
import styles from './BottomNav.module.css';

export const NAV_ITEMS: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/trickbook', label: 'Trickbook', icon: BookOpen },
  { to: '/play', label: 'Play', icon: Shuffle },
  { to: '/sessions', label: 'Sessions', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
];

/** Bottom tab bar on phones; becomes a left rail on tablets and desktops. */
export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Main">
      <ul className={styles.list}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
              <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
              <span className={styles.label}>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
