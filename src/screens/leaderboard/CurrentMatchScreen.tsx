import { ArrowRight, Plus } from 'lucide-react';
import { ButtonLink } from '../../components/Button';
import { MatchSummaryCard } from '../../components/MatchSummaryCard';
import { StandingRow } from '../../components/StandingRow';
import { EmptyState, ErrorState, LoadingState } from '../../components/States';
import { DiceSticker } from '../../components/Stickers';
import { combineQueries, usePlayers, useQuery, type PlayerDirectory } from '../../data/DataProvider';
import { snapshotMatch } from '../../domain/rules';
import type { Match } from '../../domain/types';
import { joinNames } from '../../lib/format';
import styles from './Leaderboard.module.css';

export function CurrentMatchScreen() {
  const players = usePlayers();
  const active = useQuery((repo) => repo.getActiveMatch(), []);

  const state = combineQueries(active, players);
  if (state.status === 'loading') return <LoadingState label="Loading current match" rows={4} />;
  if (state.status === 'error') return <ErrorState error={state.error} onRetry={state.retry} />;
  if (active.status !== 'success' || players.status !== 'success') return null;

  if (!active.data) {
    return (
      <EmptyState
        art={<DiceSticker size={84} />}
        title="No Active Match"
        body="Start a new game with your friends and get the session going."
        action={
          <ButtonLink to="/play/start" icon={<Plus size={20} aria-hidden="true" />}>
            Start a Match
          </ButtonLink>
        }
      />
    );
  }

  return <LiveStandings match={active.data} players={players.data} />;
}

function LiveStandings({ match, players }: { match: Match; players: PlayerDirectory }) {
  const snap = snapshotMatch(match);
  const leaders = snap.standings.filter((s) => s.isLeader).map((s) => players.get(s.playerId).username);
  const turnPlayer = snap.turn ? players.get(snap.turn.playerId).username : null;

  return (
    <div className="split">
      <div className="stack">
        <MatchSummaryCard match={match} />
        <dl className={styles.facts}>
          <div>
            <dt>Leading</dt>
            <dd>{leaders.length === 0 ? '—' : leaders.length === 1 ? leaders[0] : `Tied: ${joinNames(leaders)}`}</dd>
          </div>
          <div>
            <dt>Up now</dt>
            <dd>{turnPlayer && snap.turn ? `${turnPlayer} ${snap.turn.action}` : '—'}</dd>
          </div>
          {snap.progressNote && (
            <div>
              <dt>Progress</dt>
              <dd>{snap.progressNote}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="stack">
        <h2 className="visually-hidden">Standings</h2>
        <ol className={`list-reset ${styles.standings}`}>
          {snap.standings.map((s) => (
            <StandingRow
              key={s.playerId}
              standing={s}
              player={players.get(s.playerId)}
              gameType={match.gameType}
              isMe={s.playerId === players.me.id}
              turnAction={snap.turn?.playerId === s.playerId ? snap.turn.action : undefined}
            />
          ))}
        </ol>
        <ButtonLink to={`/play/matches/${match.id}`} block icon={<ArrowRight size={18} aria-hidden="true" />}>
          View Match Details
        </ButtonLink>
      </div>
    </div>
  );
}
