import { useState } from 'react';
import { Gamepad2, Percent, Plus, Trophy } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Avatar } from '../../components/Avatar';
import { CrownIcon } from '../../components/BrandIcons';
import { ButtonLink } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatStrip } from '../../components/StatStrip';
import { EmptyState, ErrorState, LoadingState } from '../../components/States';
import { ChoiceTabs } from '../../components/Tabs';
import { combineQueries, usePlayers, useQuery } from '../../data/DataProvider';
import { computeFriendsRanking, formatWinRate, startOfMonth } from '../../domain/ranking';
import { GAME_LABELS, type GameType } from '../../domain/types';
import styles from './Leaderboard.module.css';

const FILTERS: Array<{ value: '' | GameType; label: string }> = [
  { value: '', label: 'All games' },
  { value: 'skate', label: GAME_LABELS.skate },
  { value: 'skate-dice', label: GAME_LABELS['skate-dice'] },
];

export function FriendsRankingScreen() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('game');
  const game: GameType | undefined = raw === 'skate' || raw === 'skate-dice' ? raw : undefined;
  const [period, setPeriod] = useState<'all' | 'month'>('all');

  const players = usePlayers();
  const results = useQuery((repo) => repo.listMatchResults(), []);
  const state = combineQueries(results, players);

  const controls = (
    <>
      <ChoiceTabs
        label="Time period"
        value={period}
        onChange={setPeriod}
        options={[
          { value: 'all', label: 'All Friends' },
          { value: 'month', label: 'This Month' },
        ]}
      />
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
    </>
  );

  let body;
  if (state.status === 'loading') body = <LoadingState label="Loading friends ranking" rows={5} />;
  else if (state.status === 'error') body = <ErrorState error={state.error} onRetry={state.retry} />;
  else if (results.status === 'success' && players.status === 'success') {
    const rows = computeFriendsRanking(results.data, players.data.members, {
      gameType: game,
      since: period === 'month' ? startOfMonth() : undefined,
    });
    const me = rows.find((r) => r.playerId === players.data.me.id);

    if (rows.every((r) => r.played === 0)) {
      body = (
        <EmptyState
          art={<Trophy size={44} aria-hidden="true" />}
          title="No Rankings Yet"
          body={
            game || period === 'month'
              ? 'No completed matches for this filter yet.'
              : 'Play some games with your friends to see the leaderboard.'
          }
          action={
            <ButtonLink to="/play/start" icon={<Plus size={20} aria-hidden="true" />}>
              Start a Match
            </ButtonLink>
          }
        />
      );
    } else {
      body = (
        <div className="split">
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Friends ranking{game ? ` for ${GAME_LABELS[game]}` : ''}
                {period === 'month' ? ', this month' : ''}: you and your accepted friends
              </caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Player</th>
                  <th scope="col" className={styles.num}>
                    Wins
                  </th>
                  <th scope="col" className={styles.num}>
                    Losses
                  </th>
                  <th scope="col" className={styles.num}>
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const player = players.data.get(row.playerId);
                  const isMe = row.playerId === players.data.me.id;
                  const leads = row.rank === 1 && row.played > 0;
                  return (
                    <tr
                      key={row.playerId}
                      className={[isMe && styles.meRow, leads && styles.leadRow].filter(Boolean).join(' ') || undefined}
                      aria-current={isMe ? 'true' : undefined}
                    >
                      <td className={`${styles.rankCell} display`}>
                        {leads ? (
                          <>
                            <CrownIcon size={22} />
                            <span className="visually-hidden">1</span>
                          </>
                        ) : (
                          row.rank
                        )}
                      </td>
                      <td>
                        <span className={styles.skater}>
                          <Avatar player={player} size={34} />
                          <span className={styles.skaterName}>{player.username}</span>
                          {isMe && <span className={styles.youTag}>You</span>}
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
          </div>

          {me && (
            <StatStrip
              label="Your record"
              stats={[
                { icon: <Gamepad2 size={20} aria-hidden="true" />, value: me.played, label: 'Total Games', tone: 'cyan' },
                { icon: <Trophy size={20} aria-hidden="true" />, value: me.wins, label: 'Total Wins', tone: 'volt' },
                { icon: <Percent size={20} aria-hidden="true" />, value: formatWinRate(me.winRate), label: 'Win Rate', tone: 'white' },
              ]}
            />
          )}
        </div>
      );
    }
  }

  return (
    <>
      <ScreenHeader title="Friends Ranking" backTo="/play" backLabel="Back to Play" />
      {controls}
      {body}
    </>
  );
}
