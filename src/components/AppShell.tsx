import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { useRepository } from '../data/DataProvider';
import { BottomNav } from './BottomNav';
import { Logo } from './Logo';
import styles from './AppShell.module.css';

export function AppShell() {
  const { pathname } = useLocation();
  const repo = useRepository();

  useEffect(() => {
    window.scrollTo?.({ top: 0 });
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <Link to="/" className={styles.railLogo} aria-label="Seshy home">
        <Logo size="sm" />
      </Link>
      {repo.source === 'sample' && (
        <p className={styles.sampleBanner}>
          <strong>Sample data</strong> — fictional skaters and matches for the Phase 1 preview.
        </p>
      )}
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
