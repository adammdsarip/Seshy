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
    expect(screen.getByRole('button', { name: 'Start Match' })).toBeDisabled();
    expect(screen.getByText(/can’t be started/)).toBeInTheDocument();
  });

  it('selects 1–4 friends and caps the match at five players', async () => {
    const { user } = renderApp('/play/start');
    const jay = await screen.findByRole('checkbox', { name: /Jay/ });
    expect(screen.getByText(/1 player · Skate Dice · 5 rounds · pick at least one friend/)).toBeInTheDocument();
    await user.click(jay);
    expect(screen.getByText(/2 players · Skate Dice · 5 rounds$/)).toBeInTheDocument();
    for (const name of [/Alex/, /Mia/, /Sam/]) await user.click(screen.getByRole('checkbox', { name }));
    expect(screen.getByText(/5 players/)).toBeInTheDocument();
    // Everyone is picked, so unpick one and confirm the box frees up again.
    await user.click(jay);
    expect(screen.getByText(/4 players/)).toBeInTheDocument();
  });

  it('adjusts rounds for Skate Dice only, within limits', async () => {
    const { user } = renderApp('/play/start?game=skate-dice');
    const more = await screen.findByRole('button', { name: 'More rounds' });
    for (let i = 0; i < 8; i++) await user.click(more);
    expect(more).toBeDisabled();
    expect(screen.getByText(/10 rounds/)).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Game of S\.K\.A\.T\.E\./ }));
    expect(screen.queryByRole('button', { name: 'More rounds' })).not.toBeInTheDocument();
  });

  it('shows invites as not available yet', async () => {
    renderApp('/play/start');
    expect(await screen.findByText('Add Friend')).toBeInTheDocument();
    expect(screen.getByText('Soon')).toBeInTheDocument();
  });
});

describe('Current Match', () => {
  it('shows standings, leader, turn and S.K.A.T.E. letters', async () => {
    renderApp('/play/leaderboard/current');
    expect(await screen.findByText(/is leading/)).toBeInTheDocument();
    expect(screen.getAllByText('Up now')).toHaveLength(1);
    expect(screen.getByRole('region', { name: 'Whose turn it is' })).toHaveTextContent(/turn/);
    expect(screen.getAllByRole('img', { name: /letters|No letters/ }).length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Match Details/ })).toHaveAttribute('href', '/play/matches/sample-live-1');
  });

  it('has working Leaderboard / Game Log tabs and honest disabled controls', async () => {
    const { user } = renderApp('/play/leaderboard/current');
    const board = await screen.findByRole('button', { name: 'Leaderboard' });
    expect(board).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'End Match' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next Turn' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Game Log' }));
    expect(screen.getByRole('region', { name: 'Game log' })).toBeInTheDocument();
    expect(screen.getAllByRole('time').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'End Match' })).not.toBeInTheDocument();
  });

  it('shows an empty state when no match is running', async () => {
    renderApp('/play/leaderboard/current', { scenario: 'empty' });
    expect(await screen.findByRole('heading', { name: 'No Active Match' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start a Match/ })).toHaveAttribute('href', '/play/start');
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
    expect(within(table).getByRole('row', { current: true })).toHaveTextContent('Adam');
    expect(within(table).getByRole('row', { current: true })).toHaveTextContent('You');
  });

  it('can be limited to this month', async () => {
    const { user } = renderApp('/play/leaderboard/friends');
    await screen.findByRole('table');
    expect(screen.getByRole('button', { name: 'All Friends' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'This Month' }));
    expect(screen.getByRole('button', { name: 'This Month' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('table', { name: /this month/ })).toBeInTheDocument();
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
    expect(await screen.findByRole('button', { name: 'Summary' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Final Results' })).toBeInTheDocument();
  });

  it('shows an empty state', async () => {
    renderApp('/play/history', { scenario: 'empty' });
    expect(await screen.findByRole('heading', { name: 'No Matches Yet' })).toBeInTheDocument();
  });
});

describe('Match Details', () => {
  it('shows the result, facts and final results', async () => {
    renderApp('/play/matches/sample-match-1');
    expect(await screen.findByText(/wins!|You win!|draw!/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Play Again/ })).toHaveAttribute('href', '/play/start?game=skate');
    const facts = screen.getByRole('group', { name: 'Match facts' });
    expect(facts).toHaveTextContent('Duration');
    expect(facts).toHaveTextContent('Completed');
    expect(screen.getByRole('heading', { name: 'Final Results' })).toBeInTheDocument();
  });

  it('has an expandable game log on its own tab', async () => {
    const { user } = renderApp('/play/matches/sample-match-1');
    await user.click(await screen.findByRole('button', { name: 'Game Log' }));
    const toggle = screen.getByRole('button', { name: /Show full log/ });
    const before = screen.getAllByRole('time').length;
    await user.click(toggle);
    expect(screen.getAllByRole('time').length).toBeGreaterThan(before);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows a live match as standings with no result banner', async () => {
    renderApp('/play/matches/sample-live-1');
    expect(await screen.findByRole('heading', { name: 'Standings' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Play Again/ })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Match facts' })).toHaveTextContent('Live');
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

describe('Home', () => {
  it('shows real stats derived from results, the game cards and quick actions', async () => {
    renderApp('/');
    const stats = await screen.findByRole('group', { name: 'Your stats' });
    expect(stats).toHaveTextContent('Total Wins');
    expect(stats).toHaveTextContent('Win Rate');
    expect(stats).toHaveTextContent('Win Streak');
    expect(within(screen.getByRole('main')).getByRole('img', { name: 'Seshy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Skate Dice/ })).toHaveAttribute('href', '/play/start?game=skate-dice');
    const quick = screen.getByRole('navigation', { name: 'Quick actions' });
    expect(within(quick).getAllByRole('link').map((l) => l.getAttribute('href'))).toEqual([
      '/play/start',
      '/play/history',
      '/play/leaderboard/friends',
      '/sessions',
    ]);
    expect(await screen.findAllByRole('link', { name: /View match details/ })).toHaveLength(3);
  });
});

describe('Profile', () => {
  it('shows your record, shortcuts and disabled editing', async () => {
    renderApp('/profile');
    expect(await screen.findByRole('heading', { name: 'Adam' })).toBeInTheDocument();
    expect(screen.getByText('@adam_skates')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Your record' })).toHaveTextContent('Win Rate');
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('link', { name: 'Trickbook' })).toHaveAttribute('href', '/trickbook');
    expect(main.getByRole('link', { name: 'Sessions' })).toHaveAttribute('href', '/sessions');
    expect(main.getByRole('link', { name: /Friends/ })).toHaveAttribute('href', '/profile/friends');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeDisabled();
    expect(screen.getByText('Achievements').closest('[aria-disabled]')).not.toBeNull();
  });

  it('lists accepted friends only, with no search', async () => {
    renderApp('/profile/friends');
    expect(await screen.findByText('Jay')).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.getByText(/no public search/)).toBeInTheDocument();
  });
});

describe('Settings', () => {
  it('shows grouped settings, marking unbuilt ones as coming soon', () => {
    renderApp('/settings');
    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'App' })).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText(/^v\d+\.\d+\.\d+/)).toBeInTheDocument();
    expect(screen.getAllByText('Soon')).toHaveLength(4);
  });
});

describe('Trickbook and Sessions', () => {
  it.each(['/trickbook', '/sessions'])('%s is an honest placeholder', (path) => {
    renderApp(path);
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });
});
