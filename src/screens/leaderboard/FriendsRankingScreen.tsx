import { Gamepad2, Percent, Plus, Trophy } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Avatar } from '../../components/Avatar';
import { ButtonLink } from '../../components/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/States';
import { CrownSticker } from '../../components/Stickers';
import { combineQueries, usePlayers, useQuery } from '../../data/DataProvider';
import { computeFriendsRanking, formatWinRate } from '../../domain/ranking';
import { GAME_LABELS, type GameType } from '../../domain/types';
import styles from './Leaderboard.module.css';

const FILTERS: Array<{ value: '' | GameType; label: string }> = [
  { value: '', label: 'All games' },
  { value: 'skate', label: GAME_LABELS.skate },
  { value: 'skate-dice', label: GAME_LABELS['skate-dice'] },
];

const BAR_TONES = ['var(--lime)', 'var(--purple)', 'var(--orange)', 'var(--offwhite)'];

export function FriendsRankingScreen() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('game');
  const game: GameType | undefined = raw === 'skate' || raw === 'skate-dice' ? raw : undefined;

  const players = usePlayers();
  const results = useQuery((repo) => repo.listMatchResults(), []);

  const filter = (
    <div className={styles.filterRow}>
      <label htmlFor="ranking-game" className="visually-hidden">
        Filter by game
      </label>
      <select
        id="ranking-game"
        className={styles.select}
        value={game ?? ''}
        onChange={(e) => setParams(e.target.value ? { game: e.target.value } : {}, { replace: true })}
      >
        {FILTERS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <p className={styles.rule}>Completed matches only · ties share a rank</p>
    </div>
  );

  const state = combineQueries(results, players);
  if (state.status === 'loading') return <LoadingState label="Loading friends ranking" rows={5} />;
  if (state.status === 'error') return <ErrorState error={state.error} onRetry={state.retry} />;
  if (results.status !== 'success' || players.status !== 'success') return null;

  const rows = computeFriendsRanking(results.data, players.data.members, game);
  const me = rows.find((r) => r.playerId === players.data.me.id);

  if (rows.every((r) => r.played === 0)) {
    return (
      <>
        {game && filter}
        <EmptyState
          art={<Trophy size={84} strokeWidth={1.6} aria-hidden="true" />}
          title="No Rankings Yet"
          body={
            game
              ? `Nobody has finished a ${GAME_LABELS[game]} match yet.`
              : 'Play some games with your friends to see the leaderboard.'
          }
          action={
            <ButtonLink to="/play/start" icon={<Plus size={20} aria-hidden="true" />}>
              Start a Match
            </ButtonLink>
          }
        />
      </>
    );
  }

  return (
    <div className="stack">
      {filter}
      <div className="split">
        <table className={styles.table}>
          <caption className="visually-hidden">
            Friends ranking{game ? ` for ${GAME_LABELS[game]}` : ''}: you and your accepted friends
          </caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Skater</th>
              <th scope="col" className={styles.num}>
                <abbr title="Wins">W</abbr>
              </th>
              <th scope="col" className={styles.num}>
                <abbr title="Losses">L</abbr>
              </th>
              <th scope="col" className={styles.num}>
                Win rate
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const player = players.data.get(row.playerId);
              const isMe = row.playerId === players.data.me.id;
              return (
                <tr key={row.playerId} className={isMe ? styles.meRow : undefined} aria-current={isMe ? 'true' : undefined}>
                  <td className={`${styles.rankCell} display`}>
                    {row.rank === 1 && row.played > 0 ? (
                      <>
                        <CrownSticker size={22} />
                        <span className="visually-hidden">1</span>
                      </>
                    ) : (
                      row.rank
                    )}
                  </td>
                  <td>
                    <span className={styles.skater}>
                      <Avatar player={player} size={36} />
                      <span className={styles.skaterText}>
                        <span className={styles.skaterName}>{player.username}</span>
                        <span className={styles.bar} aria-hidden="true">
                          <span
                            style={{ width: `${(row.winRate ?? 0) * 100}%`, background: BAR_TONES[i % BAR_TONES.length] }}
                          />
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className={styles.num}>{row.wins}</td>
                  <td className={styles.num}>{row.losses}</td>
                  <td className={`${styles.num} ${styles.rate}`}>{formatWinRate(row.winRate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {me && (
          <section aria-label="Your record" className={styles.summary}>
            <div className={styles.stat}>
              <Gamepad2 size={20} aria-hidden="true" />
              <span className={styles.statLabel}>Your games</span>
              <span className={`${styles.statValue} display`}>{me.played}</span>
            </div>
            <div className={styles.stat}>
              <Trophy size={20} aria-hidden="true" />
              <span className={styles.statLabel}>Your wins</span>
              <span className={`${styles.statValue} display`}>{me.wins}</span>
            </div>
            <div className={styles.stat}>
              <Percent size={20} aria-hidden="true" />
              <span className={styles.statLabel}>Win rate</span>
              <span className={`${styles.statValue} display`}>{formatWinRate(me.winRate)}</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
