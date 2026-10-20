import { toMatchResult } from '../../domain/rules';
import type { SeshyRepository } from '../repository';
import { SAMPLE_FRIENDS, SAMPLE_ME, buildSampleMatches } from './fixtures';

/**
 * SAMPLE DATA ONLY. In-memory repository used until a real backend exists.
 *
 * During development, add `?sample=<scenario>` to any URL to preview other
 * UI states (remembered for the browser tab; `?sample=default` resets):
 *   empty — no friends' results, no active match
 *   error — every request fails
 *   slow  — requests take ~2 seconds
 */
export type SampleScenario = 'default' | 'empty' | 'error' | 'slow';

const SCENARIOS: SampleScenario[] = ['default', 'empty', 'error', 'slow'];
const STORAGE_KEY = 'seshy.sampleScenario';

export function readSampleScenario(): SampleScenario {
  if (typeof window === 'undefined') return 'default';
  const param = new URLSearchParams(window.location.search).get('sample') as SampleScenario | null;
  try {
    if (param && SCENARIOS.includes(param)) {
      window.sessionStorage.setItem(STORAGE_KEY, param);
      return param;
    }
    const stored = window.sessionStorage.getItem(STORAGE_KEY) as SampleScenario | null;
    return stored && SCENARIOS.includes(stored) ? stored : 'default';
  } catch {
    return param && SCENARIOS.includes(param) ? param : 'default';
  }
}

export function createSampleRepository(options: { scenario?: () => SampleScenario; latencyMs?: number } = {}): SeshyRepository {
  const scenario = options.scenario ?? readSampleScenario;
  const latency = options.latencyMs ?? 250;
  const world = buildSampleMatches();
  const allMatches = [world.active, ...world.finished];

  function respond<T>(value: () => T): Promise<T> {
    const current = scenario();
    const delay = current === 'slow' ? 2000 : latency;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (current === 'error') reject(new Error('Sample error: the server could not be reached.'));
        else resolve(value());
      }, delay);
    });
  }

  const isEmpty = () => scenario() === 'empty';

  return {
    source: 'sample',
    getCurrentUser: () => respond(() => SAMPLE_ME),
    listFriends: () => respond(() => SAMPLE_FRIENDS),
    getActiveMatch: () => respond(() => (isEmpty() ? null : world.active)),
    getMatch: (matchId) => respond(() => (isEmpty() ? null : (allMatches.find((m) => m.id === matchId) ?? null))),
    listMatchResults: () =>
      respond(() =>
        isEmpty()
          ? []
          : world.finished
              .map(toMatchResult)
              .sort((a, b) => b.endedAt.localeCompare(a.endedAt)),
      ),
  };
}
