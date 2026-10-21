import { BookOpen, CalendarDays, Settings, Trophy, Users } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { ListGroup, ListRow } from '../components/ListRow';
import { MatchRow } from '../components/MatchRow';
import { Panel } from '../components/Panel';
import { HeaderAction, ScreenHeader } from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/States';
import { combineQueries, usePlayers, useQuery } from '../data/DataProvider';
import { computeFriendsRanking, formatWinRate } from '../domain/ranking';
import styles from './ProfileScreen.module.css';

export function ProfileScreen() {
  const players = usePlayers();
  const results = useQuery((repo) => repo.listMatchResults(), []);
  const state = combineQueries(players, results);

  const header = (
    <ScreenHeader
      title="Profile"
      actions={
        <HeaderAction to="/settings" label="Settings">
          <Settings size={22} aria-hidden="true" />
        </HeaderAction>
      }
    />
  );

  if (state.status === 'loading')
    return (
      <>
        {header}
        <LoadingState label="Loading profile" rows={4} />
      </>
    );
  if (state.status === 'error')
    return (
      <>
        {header}
        <ErrorState error={state.error} onRetry={state.retry} />
      </>
    );
  if (players.status !== 'success' || results.status !== 'success') return null;

  const dir = players.data;
  const ranking = computeFriendsRanking(results.data, dir.members);
  const mine = ranking.find((r) => r.playerId === dir.me.id)!;

  return (
    <>
      {header}
      <div className="split">
        <div className="stack-lg">
          <section className={styles.hero} aria-label="Your profile">
            <Avatar player={dir.me} size={92} />
            <h2 className={`${styles.name} display`}>{dir.me.username}</h2>
            {dir.me.handle && <p className={styles.handle}>@{dir.me.handle}</p>}
            <Button variant="secondary" disabled className={styles.edit} title="Profile editing is coming soon">
              Edit Profile
            </Button>
          </section>

          <div role="group" aria-label="Your record">
            <dl className={styles.stats}>
              <div>
                <dd className={`${styles.volt} display`}>{mine.wins}</dd>
                <dt>Wins</dt>
              </div>
              <div>
                <dd className={`${styles.coral} display`}>{mine.losses}</dd>
                <dt>Losses</dt>
              </div>
              <div>
                <dd className={`${styles.cyan} display`}>{formatWinRate(mine.winRate)}</dd>
                <dt>Win Rate</dt>
              </div>
            </dl>
          </div>

          <ListGroup>
            <ListRow icon={<BookOpen size={20} aria-hidden="true" />} label="Trickbook" to="/trickbook" />
            <ListRow icon={<CalendarDays size={20} aria-hidden="true" />} label="Sessions" to="/sessions" />
            <ListRow
              icon={<Users size={20} aria-hidden="true" />}
              label="Friends"
              value={`${dir.friends.length} ${dir.friends.length === 1 ? 'friend' : 'friends'}`}
              to="/profile/friends"
            />
            <ListRow icon={<Trophy size={20} aria-hidden="true" />} label="Achievements" soon />
          </ListGroup>
        </div>

        <Panel title="Recent Matches" action={{ to: '/play/history', label: 'See All', ariaLabel: 'See all match history' }}>
          {results.data.length === 0 ? (
            <p className="muted">No matches yet.</p>
          ) : (
            <ul className="list-reset">
              {results.data.slice(0, 4).map((r) => (
                <MatchRow key={r.matchId} result={r} players={dir} />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
