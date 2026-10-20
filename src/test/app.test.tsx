import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createSampleRepository, type SampleScenario } from '../data/sample/sampleRepository';
import { renderApp } from './renderApp';

const mainNav = () => screen.getByRole('navigation', { name: 'Main' });

describe('main navigation', () => {
  it('navigates between all five destinations and marks the active one', async () => {
    const { user } = renderApp('/');
    const expected: Array<[string, string]> = [
      ['Trickbook', 'Trickbook'],
      ['Play', 'Play'],
      ['Sessions', 'Sessions'],
      ['Profile', 'Profile'],
    ];
    for (const [link, heading] of expected) {
      await user.click(within(mainNav()).getByRole('link', { name: link }));
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
      expect(within(mainNav()).getByRole('link', { name: link })).toHaveAttribute('aria-current', 'page');
    }
    await user.click(within(mainNav()).getByRole('link', { name: 'Home' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Seshy home' })).toBeInTheDocument();
  });

  it('keeps Play active on nested play screens', async () => {
    renderApp('/play/history');
    expect(within(mainNav()).getByRole('link', { name: 'Play' })).toHaveAttribute('aria-current', 'page');
  });

  it('flags sample data', () => {
    renderApp('/');
    expect(screen.getByText(/fictional skaters and matches/i)).toBeInTheDocument();
  });

  it('shows a not-found screen for unknown routes', () => {
    renderApp('/nope');
    expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument();
  });
});

describe('Play screen', () => {
  it('links to every play destination', async () => {
    renderApp('/play');
    expect(screen.getByRole('link', { name: /Skate Dice/ })).toHaveAttribute('href', '/play/start?game=skate-dice');
    expect(screen.getByRole('link', { name: /Game of S\.K\.A\.T\.E\./ })).toHaveAttribute('href', '/play/start?game=skate');
    expect(screen.getByRole('link', { name: /Start a New Match/ })).toHaveAttribute('href', '/play/start');
    const quick = screen.getByRole('navigation', { name: 'Quick access' });
    expect(within(quick).getByRole('link', { name: 'Current Match' })).toHaveAttribute('href', '/play/leaderboard/current');
    expect(within(quick).getByRole('link', { name: 'Friends Ranking' })).toHaveAttribute('href', '/play/leaderboard/friends');
    expect(within(quick).getByRole('link', { name: 'Match History' })).toHaveAttribute('href', '/play/history');
    expect(await screen.findByRole('link', { name: /Open the current match leaderboard/ })).toBeInTheDocument();
    expect(await screen.findAllByRole('link', { name: /View match details/ })).toHaveLength(3);
  });
});

describe('Start a Match', () => {
  it('lets you pick a game but honestly disables starting', async () => {
    const { user } = renderApp('/play/start?game=skate-dice');
    expect(screen.getByText('How Skate Dice works')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Game of S\.K\.A\.T\.E\./ }));
    expect(screen.getByText('How Game of S.K.A.T.E. works')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Game of S.K.A.T.E.' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Pass & play/ })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Online/ })).toBeDisabled();
  });
});

describe('Current Match leaderboard', () => {
  it('shows standings, leader, turn and S.K.A.T.E. letters', async () => {
    renderApp('/play/leaderboard/current');
    expect(await screen.findByText('Leading')).toBeInTheDocument();
    // In the facts panel and on the player whose turn it is.
    expect(screen.getAllByText('Up now')).toHaveLength(2);
    expect(screen.getAllByRole('img', { name: /letters|No letters/ }).length).toBe(4);
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Match Details/ })).toHaveAttribute('href', '/play/matches/sample-live-1');
  });

  it('shows an empty state when no match is running', async () => {
    renderApp('/play/leaderboard/current', { scenario: 'empty' });
    expect(await screen.findByRole('heading', { name: 'No Active Match' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start a Match/ })).toHaveAttribute('href', '/play/start');
  });

  it('switches to Friends Ranking via the tabs', async () => {
    const { user } = renderApp('/play/leaderboard/current');
    await user.click(screen.getByRole('link', { name: 'Friends Ranking' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });
});

describe('Friends Ranking', () => {
  it('lists you and your friends with wins, losses and win rate', async () => {
    renderApp('/play/leaderboard/friends');
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(5);
    const wins = rows.map((r) => Number(within(r).getAllByRole('cell')[2]!.textContent));
    expect([...wins].sort((a, b) => b - a)).toEqual(wins);
    expect(within(table).getByRole('row', { current: true })).toHaveTextContent('You');
  });

  it('filters by game', async () => {
    const { user } = renderApp('/play/leaderboard/friends');
    const select = await screen.findByLabelText('Filter by game');
    await user.selectOptions(select, 'skate-dice');
    expect(screen.getByRole('table')).toHaveAccessibleName(/Skate Dice/);
  });

  it('shows an empty state with no completed matches', async () => {
    renderApp('/play/leaderboard/friends', { scenario: 'empty' });
    expect(await screen.findByRole('heading', { name: 'No Rankings Yet' })).toBeInTheDocument();
  });
});

describe('Match History', () => {
  it('lists finished matches, filters by game and opens details', async () => {
    const { user } = renderApp('/play/history');
    const all = await screen.findAllByRole('link', { name: /View match details/ });
    expect(all.length).toBe(13);
    expect(screen.getByText(/abandoned matches don’t count/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Skate Dice' }));
    const dice = screen.getAllByRole('link', { name: /View match details/ });
    expect(dice.length).toBeLessThan(all.length);
    dice.forEach((link) => expect(link).toHaveAccessibleName(/Skate Dice/));
    expect(screen.getByRole('button', { name: 'Skate Dice' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(dice[0]!);
    expect(await screen.findByRole('heading', { level: 1, name: 'Match Details' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Game Log' })).toBeInTheDocument();
  });

  it('shows an empty state', async () => {
    renderApp('/play/history', { scenario: 'empty' });
    expect(await screen.findByRole('heading', { name: 'No Matches Yet' })).toBeInTheDocument();
  });
});

describe('Match Details', () => {
  it('shows the result, players and an expandable game log', async () => {
    const { user } = renderApp('/play/matches/sample-match-1');
    expect(await screen.findByText(/wins!|You win!|draw!/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Play Again/ })).toHaveAttribute('href', '/play/start?game=skate');
    const toggle = screen.getByRole('button', { name: /Show full log/ });
    const before = screen.getAllByRole('time').length;
    await user.click(toggle);
    expect(screen.getAllByRole('time').length).toBeGreaterThan(before);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('disables gameplay controls on a live match', async () => {
    renderApp('/play/matches/sample-live-1');
    expect(await screen.findByRole('button', { name: 'End Match' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next Turn' })).toBeDisabled();
  });

  it('handles unknown matches', async () => {
    renderApp('/play/matches/does-not-exist');
    expect(await screen.findByRole('heading', { name: 'Match Not Found' })).toBeInTheDocument();
  });
});

describe('errors', () => {
  it('shows an error and recovers on retry', async () => {
    let scenario: SampleScenario = 'error';
    const repository = createSampleRepository({ scenario: () => scenario, latencyMs: 0 });
    const { user } = renderApp('/play/history', { repository });
    expect(await screen.findByRole('alert')).toHaveTextContent('Couldn’t load this');
    scenario = 'default';
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(await screen.findAllByRole('link', { name: /View match details/ })).toHaveLength(13);
  });
});

describe('Profile', () => {
  it('shows your record and accepted friends only', async () => {
    renderApp('/profile');
    expect(await screen.findByText('Wins')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Friends (4)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeDisabled();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});
