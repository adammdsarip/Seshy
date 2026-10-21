import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Player } from '../domain/types';
import type { SeshyRepository } from './repository';
import { createSampleRepository } from './sample/sampleRepository';

const RepositoryContext = createContext<SeshyRepository | null>(null);

/**
 * Supplies the data source to the app. Until a backend exists the default is
 * the sample repository; tests and future builds pass their own.
 */
export function DataProvider({ repository, children }: { repository?: SeshyRepository; children: ReactNode }) {
  const value = useMemo(() => repository ?? createSampleRepository(), [repository]);
  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
}

export function useRepository(): SeshyRepository {
  const repo = useContext(RepositoryContext);
  if (!repo) throw new Error('useRepository must be used inside <DataProvider>');
  return repo;
}

export type QueryState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined; retry: () => void }
  | { status: 'error'; data?: undefined; error: Error; retry: () => void }
  | { status: 'success'; data: T; error?: undefined; retry: () => void };

/** Loads data from the repository with loading / error / retry handling. */
export function useQuery<T>(load: (repo: SeshyRepository) => Promise<T>, deps: unknown[]): QueryState<T> {
  const repo = useRepository();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: T }>({
    status: 'loading',
  });
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    load(repo).then(
      (data) => !cancelled && setState({ status: 'success', data }),
      (error: unknown) =>
        !cancelled && setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, attempt, ...deps]);

  return { ...state, retry } as QueryState<T>;
}

export interface PlayerDirectory {
  me: Player;
  friends: Player[];
  /** Viewer first, then friends. */
  members: Player[];
  get(id: string): Player;
}

const UNKNOWN = (id: string): Player => ({ id, username: 'Unknown skater', avatarTone: 'white' });

/** The viewer and their accepted friends, with lookup by id. */
export function usePlayers(): QueryState<PlayerDirectory> {
  return useQuery(async (repo) => {
    const [me, friends] = await Promise.all([repo.getCurrentUser(), repo.listFriends()]);
    const members = [me, ...friends];
    const byId = new Map(members.map((p) => [p.id, p]));
    return { me, friends, members, get: (id: string) => byId.get(id) ?? UNKNOWN(id) };
  }, []);
}

/**
 * Combines several queries: loading while any is loading, failed if any
 * failed (and retrying re-runs every failed query), otherwise ready.
 */
export function combineQueries(...queries: Array<QueryState<unknown>>):
  | { status: 'loading' }
  | { status: 'error'; error: Error; retry: () => void }
  | { status: 'success' } {
  const failed = queries.filter((q) => q.status === 'error');
  if (failed.length > 0) return { status: 'error', error: failed[0]!.error!, retry: () => failed.forEach((q) => q.retry()) };
  if (queries.some((q) => q.status === 'loading')) return { status: 'loading' };
  return { status: 'success' };
}
