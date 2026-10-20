import { History, Plus } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { ButtonLink } from '../components/Button';
import { MatchRow } from '../components/MatchRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { ChoiceTabs } from '../components/Tabs';
import { combineQueries, usePlayers, useQuery } from '../data/DataProvider';
import { GAME_LABELS, type GameType } from '../domain/types';
import styles from './MatchHistoryScreen.module.css';

export function MatchHistoryScreen() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('game');
  const game: GameType | undefined = raw === 'skate' || raw === 'skate-dice' ? raw : undefined;
  const players = usePlayers();
  const results = useQuery((repo) => repo.listMatchResults(), []);

  const state = combineQueries(results, players);
  let body;
  if (state.status === 'loading') body = <LoadingState label="Loading match history" rows={5} />;
  else if (state.status === 'error') body = <ErrorState error={state.error} onRetry={state.retry} />;
  else if (results.status === 'success' && players.status === 'success') {
    const list = game ? results.data.filter((r) => r.gameType === game) : results.data;
    body =
      list.length === 0 ? (
        <EmptyState
          art={<History size={80} strokeWidth={1.6} aria-hidden="true" />}
          title="No Matches Yet"
          body={game ? `You haven't finished a ${GAME_LABELS[game]} match yet.` : 'Finished matches with your friends will show up here.'}
          action={
            <ButtonLink to="/play/start" icon={<Plus size={20} aria-hidden="true" />}>
              Start a Match
            </ButtonLink>
          }
        />
      ) : (
        <>
          <p className={styles.count}>
            {list.length} {list.length === 1 ? 'match' : 'matches'} · abandoned matches don’t count towards rankings
          </p>
          <ul className={`list-reset ${styles.list}`}>
            {list.map((r) => (
              <MatchRow key={r.matchId} result={r} players={players.data} showSummary />
            ))}
          </ul>
        </>
      );
  }

  return (
    <>
      <ScreenHeader title="Match History" backTo="/play" backLabel="Back to Play" />
      <ChoiceTabs
        label="Filter by game"
        value={game ?? 'all'}
        onChange={(v) => setParams(v === 'all' ? {} : { game: v }, { replace: true })}
        options={[
          { value: 'all', label: 'All' },
          { value: 'skate', label: 'S.K.A.T.E.' },
          { value: 'skate-dice', label: 'Skate Dice' },
        ]}
      />
      {body}
    </>
  );
}
