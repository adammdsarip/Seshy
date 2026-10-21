import brushLogo from '../assets/brand/seshy-logo.webp';
import styles from './Logo.module.css';

/**
 * The Seshy brush logo (transparent WebP, white lettering with a volt crown and swoosh).
 * This is the only component that knows which file the logo comes from: to
 * change it, replace src/assets/brand/seshy-logo.webp and nothing else.
 */
export function Logo({ width = 120 }: { width?: number | string }) {
  return <img className={styles.logo} src={brushLogo} alt="Seshy" style={{ width }} draggable={false} />;
}
