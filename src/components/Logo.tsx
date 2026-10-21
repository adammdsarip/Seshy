import brushLogo from '../assets/brand/seshy-logo.svg';
import brushLogoVolt from '../assets/brand/seshy-logo-volt.svg';
import styles from './Logo.module.css';

/**
 * The Seshy brush logo. This is the only component that knows which file the
 * logo comes from: to swap in a different logo, replace the two SVGs in
 * src/assets/brand (white + volt crown, and all-volt) and nothing else changes.
 */
export function Logo({ width = 120, variant = 'white' }: { width?: number | string; variant?: 'white' | 'volt' }) {
  return (
    <img
      className={styles.logo}
      src={variant === 'volt' ? brushLogoVolt : brushLogo}
      alt="Seshy"
      style={{ width }}
      draggable={false}
    />
  );
}
