import { useState } from 'react';
import { Flag, RotateCcw } from 'lucide-react';
import { useParams } from 'react-router';
import { ButtonLink } from '../components/Button';
import { CrownIcon } from '../components/BrandIcons';
import { GameLog } from '../components/GameLog';
import { MatchSummaryCard } from '../components/MatchSummaryCard';
import { Panel } from '../components/Panel';
import { ScreenHeader } from '../components/ScreenHeader';
import { StandingRow } from '../components/StandingRow';
import { StatStrip } from '../components/StatStrip';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { ChoiceTabs } from '../components/Tabs';
import { combineQueries, usePlayers, useQuery, type PlayerDirectory } from '../data/DataProvider';
import { snapshotMatch } from '../domain/rules';
import type { Match } from '../domain/types';
import { formatDateTime, formatDuration, joinNames } from '../lib/format';
import styles from './MatchDetailsScreen.module.css';

export function MatchDetailsScreen() {
  const { matchId = '' } = useParams();
  const players = usePlayers();
  const match = useQuery((repo) => repo.getMatch(matchId), [matchId]);
  const state = combineQueries(match, players);

  let body;
  if (state.status === 'loading') body = <LoadingState label="Loading match" rows={5} />;
  else if (state.status === 'error') body = <ErrorState error={state.error} onRetry={state.retry} />;
  else if (match.status !== 'success' || players.status !== 'success') body = null;
  else if (!match.data)
    body = (
      <EmptyState
        art={<Flag size={44} aria-hidden="true" />}
        title="Match Not Found"
        body="This match doesn’t exist, or it isn’t one you played in."
        action={<ButtonLink to="/play/history">Back to Match History</ButtonLink>}
      />
    );
  else body = <Details match={match.data} players={players.data} />;

  const live = match.status === 'success' && match.data?.status === 'in-progress';
  return (
    <>
      <ScreenHeader
        title="Match Details"
        backTo={live ? '/play/leaderboard/current' : '/play/history'}
        backLabel={live ? 'Back to current match' : 'Back to match history'}
      />
      {body}
    </>
  );
}

function Details({ match, players }: { match: Match; players: PlayerDirectory }) {
  const [tab, setTab] = useState<'summary' | 'log'>('summary');
  const snap = snapshotMatch(match);
  const live = match.status === 'in-progress';
  const end = match.endedAt ?? match.events.at(-1)?.at ?? match.startedAt;

  const stats = [
    match.gameType === 'skate-dice'
      ? { value: match.rounds, label: 'Rounds' }
      : { value: match.events.length, label: 'Attempts' },
    { value: formatDuration(match.startedAt, live ? new Date().toISOString() : end), label: live ? 'Elapsed' : 'Duration' },
    { value: { 'in-progress': 'Live', completed: 'Completed', abandoned: 'Abandoned' }[match.status], label: 'Status' },
  ];

  return (
    <div className="split">
      <div className="stack-lg">
        <MatchSummaryCard match={match} />
        {match.status === 'completed' && <ResultBanner winnerId={snap.winnerId} players={players} match={match} end={end} />}
        <StatStrip label="Match facts" stats={stats} compact />
        {live ? null : (
          <div className={styles.controls}>
            <ButtonLink to={`/play/start?game=${match.gameType}`} icon={<RotateCcw size={18} aria-hidden="true" />}>
              Play Again
            </ButtonLink>
            <ButtonLink to="/play/history" variant="secondary">
              All Matches
            </ButtonLink>
          </div>
        )}
      </div>

      <div className="stack">
        <ChoiceTabs
          label="Match view"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'summary', label: 'Summary' },
            { value: 'log', label: 'Game Log' },
          ]}
        />
        {tab === 'summary' ? (
          <Panel title={match.status === 'completed' ? 'Final Results' : 'Standings'} bare>
            <ol className={`list-reset ${styles.players}`}>
              {snap.standings.map((s) => (
                <StandingRow
                  key={s.playerId}
                  standing={s}
                  player={players.get(s.playerId)}
                  gameType={match.gameType}
                  isMe={s.playerId === players.me.id}
                  turnAction={live && snap.turn?.playerId === s.playerId ? snap.turn.action : undefined}
                />
              ))}
            </ol>
          </Panel>
        ) : (
          <section className={styles.logCard} aria-label="Game log">
            <GameLog match={match} players={players} />
          </section>
        )}
      </div>
    </div>
  );
}

function ResultBanner({ winnerId, players, match, end }: { winnerId: string | null; players: PlayerDirectory; match: Match; end: string }) {
  const youWon = winnerId === players.me.id;
  const headline = winnerId === null ? 'It’s a draw!' : youWon ? 'You win!' : `${players.get(winnerId).username} wins!`;
  const others = match.playerIds.filter((id) => id !== winnerId).map((id) => players.get(id).username);
  return (
    <div className={`${styles.banner} ${youWon ? styles.bannerWin : ''}`}>
      <CrownIcon size={40} />
      <p className={styles.bannerText}>{headline}</p>
      <p className={styles.bannerSub}>
        {winnerId ? `Beat ${joinNames(others)}` : 'Dead heat'} · {formatDateTime(end)}
      </p>
    </div>
  );
}
