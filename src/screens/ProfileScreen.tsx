import { Percent, Trophy, X } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { ComingSoon } from '../components/ComingSoon';
import { MatchRow } from '../components/MatchRow';
import { Panel } from '../components/Panel';
import { ScreenHeader } from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/States';
import { combineQueries, usePlayers, useQuery } from '../data/DataProvider';
import { computeFriendsRanking, formatWinRate } from '../domain/ranking';
import styles from './ProfileScreen.module.css';

export function ProfileScreen() {
  const players = usePlayers();
  const results = useQuery((repo) => repo.listMatchResults(), []);

  const state = combineQueries(players, results);
  if (state.status === 'loading') {
    return (
      <>
        <ScreenHeader title="Profile" />
        <LoadingState label="Loading profile" rows={4} />
      </>
    );
  }
  if (state.status === 'error') {
    return (
      <>
        <ScreenHeader title="Profile" />
        <ErrorState error={state.error} onRetry={state.retry} />
      </>
    );
  }
  if (players.status !== 'success' || results.status !== 'success') return null;

  const dir = players.data;
  const ranking = computeFriendsRanking(results.data, dir.members);
  const mine = ranking.find((r) => r.playerId === dir.me.id)!;

  return (
    <>
      <ScreenHeader title="Profile" />
      <div className="split">
        <div className="stack-lg">
          <section className={styles.card} aria-label="Your stats">
            <div className={styles.who}>
              <Avatar player={dir.me} size={68} />
              <div className={styles.whoText}>
                <h2 className={`${styles.name} display`}>{dir.me.username}</h2>
                <p className="muted small">
                  {mine.played > 0 ? `#${mine.rank} of ${ranking.length} among friends` : 'No ranked matches yet'}
                </p>
              </div>
              <Button variant="secondary" disabled className={styles.edit} title="Profile editing is coming soon">
                Edit Profile
              </Button>
            </div>
            <dl className={styles.stats}>
              <div>
                <Trophy size={20} aria-hidden="true" className={styles.lime} />
                <dt>Wins</dt>
                <dd className="display">{mine.wins}</dd>
              </div>
              <div>
                <X size={20} aria-hidden="true" className={styles.orange} />
                <dt>Losses</dt>
                <dd className="display">{mine.losses}</dd>
              </div>
              <div>
                <Percent size={20} aria-hidden="true" className={styles.purple} />
                <dt>Win rate</dt>
                <dd className="display">{formatWinRate(mine.winRate)}</dd>
              </div>
            </dl>
          </section>

          <Panel title={`Friends (${dir.friends.length})`}>
            <ul className={`list-reset ${styles.friends}`}>
              {dir.friends.map((f) => (
                <li key={f.id}>
                  <Avatar player={f} size={44} />
                  <span>{f.username}</span>
                </li>
              ))}
            </ul>
            <p className="muted small">
              Seshy is friends-only — there’s no public search. Adding friends by invite comes in a later phase.
            </p>
          </Panel>
        </div>

        <div className="stack-lg">
          <Panel title="Recent Matches" action={{ to: '/play/history', label: 'See all', ariaLabel: 'See all match history' }}>
            {results.data.length === 0 ? (
              <p className="muted">No matches yet.</p>
            ) : (
              <ul className="list-reset">
                {results.data.slice(0, 3).map((r) => (
                  <MatchRow key={r.matchId} result={r} players={dir} />
                ))}
              </ul>
            )}
          </Panel>
          <ComingSoon title="Achievements" planned={['First Kickflip', '10 Sessions', 'Trick Collector']}>
            Badges for milestones in your Trickbook and Sessions will live here once those features ship.
          </ComingSoon>
        </div>
      </div>
    </>
  );
}
