import { CalendarDays, Flame, History, Trophy, Users, ArrowRight, ChartColumn } from 'lucide-react';
import { Link } from 'react-router';
import { Avatar } from '../components/Avatar';
import { GameCard } from '../components/GameArt';
import { Logo } from '../components/Logo';
import { MatchRow } from '../components/MatchRow';
import { Panel } from '../components/Panel';
import { StatStrip } from '../components/StatStrip';
import { ErrorState, LoadingState } from '../components/States';
import { combineQueries, usePlayers, useQuery } from '../data/DataProvider';
import { computeFriendsRanking, currentWinStreak, formatWinRate } from '../domain/ranking';
import { snapshotMatch } from '../domain/rules';
import { GAME_LABELS } from '../domain/types';
import styles from './HomeScreen.module.css';

const QUICK_ACTIONS = [
  { to: '/play/start', label: 'Start a Match', icon: Users },
  { to: '/play/history', label: 'Match History', icon: History },
  { to: '/play/leaderboard/friends', label: 'Leaderboard', icon: Trophy },
  { to: '/sessions', label: 'Sessions', icon: CalendarDays },
];

export function HomeScreen() {
  const players = usePlayers();
  const results = useQuery((repo) => repo.listMatchResults(), []);
  const active = useQuery((repo) => repo.getActiveMatch(), []);
  const data = combineQueries(players, results);

  const live = active.status === 'success' && active.data && players.status === 'success' ? active.data : null;
  const leaders = live ? snapshotMatch(live).standings.filter((s) => s.isLeader) : [];

  let stats = null;
  let recent = null;
  if (data.status === 'loading') {
    stats = <LoadingState label="Loading your stats" rows={1} />;
    recent = <LoadingState label="Loading recent games" rows={3} />;
  } else if (data.status === 'error') {
    stats = recent = <ErrorState error={data.error} onRetry={data.retry} />;
  } else if (players.status === 'success' && results.status === 'success') {
    const me = computeFriendsRanking(results.data, players.data.members).find((r) => r.playerId === players.data.me.id);
    stats = (
      <StatStrip
        label="Your stats"
        stats={[
          { icon: <Trophy size={22} aria-hidden="true" />, value: me?.wins ?? 0, label: 'Total Wins', tone: 'volt' },
          { icon: <ChartColumn size={22} aria-hidden="true" />, value: formatWinRate(me?.winRate ?? null), label: 'Win Rate', tone: 'cyan' },
          { icon: <Flame size={22} aria-hidden="true" />, value: currentWinStreak(results.data, players.data.me.id), label: 'Win Streak', tone: 'coral' },
        ]}
      />
    );
    recent =
      results.data.length === 0 ? (
        <p className="muted">No finished games yet. Your results will show up here.</p>
      ) : (
        <ul className="list-reset">
          {results.data.slice(0, 3).map((r) => (
            <MatchRow key={r.matchId} result={r} players={players.data} />
          ))}
        </ul>
      );
  }

  return (
    <div className={styles.home}>
      <header className={styles.top}>
        <h1 className="visually-hidden">Seshy home</h1>
        <span className={styles.logo}>
          <Logo width={116} />
        </span>
        {players.status === 'success' && (
          <Link to="/profile" className={styles.profileLink} aria-label="Your profile">
            <Avatar player={players.data.me} size={40} />
          </Link>
        )}
      </header>

      <div className="split">
        <div className="stack-lg">
          <div>
            <p className={styles.greeting}>Good to see you,</p>
            <p className={`${styles.name} display`}>{players.status === 'success' ? players.data.me.username : ' '}</p>
          </div>

          {stats}

          {live && players.status === 'success' && (
            <Link to="/play/leaderboard/current" className={styles.liveBar}>
              <span className={styles.liveDot} aria-hidden="true" />
              <span className={styles.liveText}>
                <strong>Live: {GAME_LABELS[live.gameType]}</strong>
                <span>
                  {leaders.length === 1 ? `${players.data.get(leaders[0]!.playerId).username} is leading` : 'Neck and neck'}
                  {live.location ? ` · ${live.location}` : ''}
                </span>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}

          <div className={styles.games}>
            <GameCard game="skate-dice" to="/play/start?game=skate-dice" />
            <GameCard game="skate" to="/play/start?game=skate" />
          </div>
        </div>

        <div className="stack-lg">
          <nav aria-label="Quick actions" className={styles.quick}>
            {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={styles.quickItem}>
                <span className={styles.quickIcon}>
                  <Icon size={22} aria-hidden="true" />
                </span>
                {label}
              </Link>
            ))}
          </nav>

          <Panel title="Recent Games" action={{ to: '/play/history', label: 'See All', ariaLabel: 'See all match history' }}>
            {recent}
          </Panel>
        </div>
      </div>
    </div>
  );
}
