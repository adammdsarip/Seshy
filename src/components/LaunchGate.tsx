import { useCallback, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { LaunchScreen } from './LaunchScreen';

const KEY = 'seshy.launched';

function alreadyLaunched(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** Shows the logo-only launch screen once per browser session, over the app. */
export function LaunchGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [done, setDone] = useState(alreadyLaunched);
  const finish = useCallback(() => {
    try {
      window.sessionStorage.setItem(KEY, '1');
    } catch {
      /* private mode: the launch screen may show again next time */
    }
    setDone(true);
  }, []);

  return (
    <>
      {children}
      {!done && pathname !== '/welcome' && <LaunchScreen onDone={finish} />}
    </>
  );
}
