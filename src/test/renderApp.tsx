import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AppRoutes } from '../App';
import { DataProvider } from '../data/DataProvider';
import type { SeshyRepository } from '../data/repository';
import { createSampleRepository, type SampleScenario } from '../data/sample/sampleRepository';

export function renderApp(
  path = '/',
  { scenario = 'default', repository }: { scenario?: SampleScenario; repository?: SeshyRepository } = {},
) {
  const repo = repository ?? createSampleRepository({ scenario: () => scenario, latencyMs: 0 });
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <DataProvider repository={repo}>
        <AppRoutes />
      </DataProvider>
    </MemoryRouter>,
  );
  return { user, repo, ...utils };
}
