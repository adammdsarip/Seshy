import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { StatusPill } from '../../components/Badges';
import { DiceIcon } from '../../components/BrandIcons';
import { Button, ButtonLink } from '../../components/Button';
import { GameLog } from '../../components/GameLog';
import { MatchSummaryCard } from '../../components/MatchSummaryCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SkateLetters } from '../../components/SkateLetters';
import { StandingRow } from '../../components/StandingRow';
import { EmptyState, ErrorState, LoadingState } from '../../components/States';
import { ChoiceTabs } from '../../components/Tabs';
import { combineQueries, usePlayers, useQuery, type PlayerDirectory } from '../../data/DataProvider';
import { snapshotMatch } from '../../domain/rules';
import type { Match } from '../../domain/types';
import { joinNames } from '../../lib/format';
import styles from './Leaderboard.module.css';

export function CurrentMatchScreen() {
  const players = usePlayers();
  const active = useQuery((repo) => repo.getActiveMatch(), []);
  const state = combineQueries(active, players);

  let body;
  if (state.status === 'loading') body = <LoadingState label="Loading current match" rows={4} />;
  else if (state.status === 'error') body = <ErrorState error={state.error} onRetry={state.retry} />;
  else if (active.status !== 'success' || players.status !== 'success') body = null;
  else if (!active.data)
    body = (
      <EmptyState
        art={<DiceIcon size={44} />}
        title="No Active Match"
        body="Start a new game with your friends and get the session going."
        action={
          <ButtonLink to="/play/start" icon={<Plus size={20} aria-hidden="true" />}>
            Start a Match
          </ButtonLink>
        }
      />
    );
  else body = <LiveMatch match={active.data} players={players.data} />;

  return (
    <>
      <ScreenHeader
        title="Current Match"
        backTo="/play"
        backLabel="Back to Play"
        actions={active.status === 'success' && active.data ? <StatusPill status={active.data.status} /> : undefined}
      />
      {body}
    </>
  );
}

function LiveMatch({ match, players }: { match: Match; players: PlayerDirectory }) {
  const [tab, setTab] = useState<'leaderboard' | 'log'>('leaderboard');
  const snap = snapshotMatch(match);
  const leaders = snap.standings.filter((s) => s.isLeader).map((s) => players.get(s.playerId).username);
  const turnStanding = snap.turn ? snap.standings.find((s) => s.playerId === snap.turn!.playerId) : undefined;
  const turnPlayer = snap.turn ? players.get(snap.turn.playerId) : null;
  const myTurn = snap.turn?.playerId === players.me.id;

  return (
    <div className="split">
      <div className="stack">
        <MatchSummaryCard match={match} showStatus={false}>
          <p className={styles.leadLine}>
            <span className="visually-hidden">Leading: </span>
            {leaders.length === 0
              ? 'Nobody has scored yet'
              : leaders.length === 1
                ? `${leaders[0]} is leading`
                : `Tied for the lead: ${joinNames(leaders)}`}
            {snap.progressNote && <span className={styles.progressNote}> · {snap.progressNote}</span>}
          </p>
        </MatchSummaryCard>
        <ButtonLink to={`/play/matches/${match.id}`} variant="secondary" block icon={<ArrowRight size={18} aria-hidden="true" />}>
          View Match Details
        </ButtonLink>
      </div>

      <div className="stack">
        <ChoiceTabs
          label="Match view"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'leaderboard', label: 'Leaderboard' },
            { value: 'log', label: 'Game Log' },
          ]}
        />

        {tab === 'leaderboard' ? (
          <>
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

            {turnPlayer && snap.turn && (
              <section className={styles.turnCard} aria-label="Whose turn it is">
                <Avatar player={turnPlayer} size={44} />
                <div className={styles.turnText}>
                  <strong>{myTurn ? 'Your turn' : `${turnPlayer.username}’s turn`}</strong>
                  <span>{snap.turn.action[0]!.toUpperCase() + snap.turn.action.slice(1)}</span>
                </div>
                {match.gameType === 'skate' && <SkateLetters count={turnStanding?.letters ?? 0} />}
              </section>
            )}

            <div className={styles.controls}>
              <Button variant="secondary" disabled aria-describedby="match-controls-note">
                End Match
              </Button>
              <Button disabled aria-describedby="match-controls-note">
                Next Turn
              </Button>
              <p id="match-controls-note" className={styles.controlsNote}>
                Scoring controls arrive with live gameplay in the next phase.
              </p>
            </div>
          </>
        ) : (
          <section className={styles.logCard} aria-label="Game log">
            <GameLog match={match} players={players} />
          </section>
        )}
      </div>
    </div>
  );
}
