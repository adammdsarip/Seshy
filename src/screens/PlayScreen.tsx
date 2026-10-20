import { ArrowRight, History, Plus, Radio, Trophy } from 'lucide-react';
import { Link } from 'react-router';
import { ButtonLink } from '../components/Button';
import { GameCard } from '../components/GameArt';
import { MatchRow } from '../components/MatchRow';
import { MatchSummaryCard } from '../components/MatchSummaryCard';
import { Panel } from '../components/Panel';
import { ScreenHeader } from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/States';
import { combineQueries, usePlayers, useQuery, type PlayerDirectory } from '../data/DataProvider';
import { snapshotMatch } from '../domain/rules';
import type { Match } from '../domain/types';
import styles from './PlayScreen.module.css';

export function PlayScreen() {
  const players = usePlayers();
  const active = useQuery((repo) => repo.getActiveMatch(), []);
  const results = useQuery((repo) => repo.listMatchResults(), []);
  const activeState = combineQueries(active, players);
  const resultsState = combineQueries(results, players);

  return (
    <>
      <ScreenHeader title="Play" />
      <div className="split">
        <div className="stack-lg">
          <section aria-label="Choose a game" className={styles.games}>
            <GameCard game="skate-dice" to="/play/start?game=skate-dice" />
            <GameCard game="skate" to="/play/start?game=skate" />
          </section>

          <ButtonLink to="/play/start" block icon={<Plus size={20} aria-hidden="true" />}>
            Start a New Match
          </ButtonLink>

          <Panel title="Current Match" bare>
            {activeState.status === 'loading' ? (
              <LoadingState label="Loading current match" rows={1} />
            ) : activeState.status === 'error' ? (
              <ErrorState error={activeState.error} onRetry={activeState.retry} />
            ) : active.status !== 'success' || players.status !== 'success' ? null : active.data ? (
              <Link to="/play/leaderboard/current" className={styles.currentLink} aria-label="Open the current match leaderboard">
                <MatchSummaryCard match={active.data} headingLevel="h3">
                  <TurnLine match={active.data} players={players.data} />
                </MatchSummaryCard>
              </Link>
            ) : (
              <div className={styles.noMatch}>
                <p>No match in progress.</p>
                <Link to="/play/start" className={styles.inlineLink}>
                  Start one
                </Link>
              </div>
            )}
          </Panel>
        </div>

        <div className="stack-lg">
          <Panel title="Recent Games" action={{ to: '/play/history', label: 'See all', ariaLabel: 'See all match history' }}>
            {resultsState.status === 'loading' ? (
              <LoadingState label="Loading recent games" />
            ) : resultsState.status === 'error' ? (
              <ErrorState error={resultsState.error} onRetry={resultsState.retry} />
            ) : results.status !== 'success' || players.status !== 'success' ? null : results.data.length === 0 ? (
              <p className="muted">No finished games yet. Your results will show up here.</p>
            ) : (
              <ul className="list-reset">
                {results.data.slice(0, 3).map((r) => (
                  <MatchRow key={r.matchId} result={r} players={players.data} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Quick Access" bare>
            <nav aria-label="Quick access" className={styles.quick}>
              <Link to="/play/leaderboard/current" className={styles.quickItem}>
                <Radio size={22} aria-hidden="true" />
                Current Match
              </Link>
              <Link to="/play/leaderboard/friends" className={styles.quickItem}>
                <Trophy size={22} aria-hidden="true" />
                Friends Ranking
              </Link>
              <Link to="/play/history" className={styles.quickItem}>
                <History size={22} aria-hidden="true" />
                Match History
              </Link>
            </nav>
          </Panel>
        </div>
      </div>
    </>
  );
}

function TurnLine({ match, players }: { match: Match; players: PlayerDirectory }) {
  const { turn } = snapshotMatch(match);
  return (
    <p className={styles.leaderLine}>
      {turn ? `Up now: ${players.get(turn.playerId).username} ${turn.action}` : 'Waiting for the next turn'}
      <ArrowRight size={16} aria-hidden="true" />
    </p>
  );
}
