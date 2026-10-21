import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { useRepository } from '../data/DataProvider';
import { BottomNav } from './BottomNav';
import { Logo } from './Logo';
import { SkateparkBackdrop } from './SkateparkBackdrop';
import styles from './AppShell.module.css';

export function AppShell() {
  const { pathname } = useLocation();
  const repo = useRepository();

  useEffect(() => {
    window.scrollTo?.({ top: 0 });
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <SkateparkBackdrop />
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <Link to="/" className={styles.railLogo} aria-label="Seshy home">
        <Logo width={64} />
      </Link>
      {repo.source === 'sample' && (
        <p className={styles.sampleBanner}>
          <strong>Sample data</strong> — fictional skaters and matches for the preview.
        </p>
      )}
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
