import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LaunchGate } from '../components/LaunchGate';
import { renderApp } from './renderApp';

describe('launch screen', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('/welcome shows only the brush logo: no text, fields, buttons or links', () => {
    const { container } = renderApp('/welcome');
    expect(screen.getByRole('img', { name: 'Seshy' })).toBeInTheDocument();
    expect(container.textContent).toBe('');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(container.querySelector('input, form, button, a')).toBeNull();
  });

  it('/welcome continues to Home by itself', () => {
    renderApp('/welcome');
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('heading', { level: 1, name: 'Seshy home' })).toBeInTheDocument();
  });

  it('shows once per session over the app, then stays away', () => {
    const first = render(
      <MemoryRouter>
        <LaunchGate>
          <p>app</p>
        </LaunchGate>
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: 'Seshy' })).toBeInTheDocument();
    expect(screen.getByText('app')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByRole('img', { name: 'Seshy' })).not.toBeInTheDocument();
    first.unmount();

    render(
      <MemoryRouter>
        <LaunchGate>
          <p>app</p>
        </LaunchGate>
      </MemoryRouter>,
    );
    expect(screen.queryByRole('img', { name: 'Seshy' })).not.toBeInTheDocument();
  });
});
