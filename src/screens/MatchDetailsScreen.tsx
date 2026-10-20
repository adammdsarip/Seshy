import { useState } from 'react';
import { Flag, RotateCcw } from 'lucide-react';
import { useParams } from 'react-router';
import { Avatar } from '../components/Avatar';
import { Button, ButtonLink } from '../components/Button';
import { MatchSummaryCard } from '../components/MatchSummaryCard';
import { Panel } from '../components/Panel';
import { ScreenHeader } from '../components/ScreenHeader';
import { StandingRow } from '../components/StandingRow';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { CrownSticker, Splat } from '../components/Stickers';
import { combineQueries, usePlayers, useQuery, type PlayerDirectory } from '../data/DataProvider';
import { snapshotMatch } from '../domain/rules';
import type { Match } from '../domain/types';
import { formatDateTime, joinNames, timeAgo } from '../lib/format';
import { buildGameLog } from '../lib/gameLog';
import styles from './MatchDetailsScreen.module.css';

const LOG_PREVIEW = 12;

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
        art={<Flag size={72} strokeWidth={1.6} aria-hidden="true" />}
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
  const snap = snapshotMatch(match);
  const log = buildGameLog(match, (id) => players.get(id).username);
  const live = match.status === 'in-progress';
  const [showAll, setShowAll] = useState(false);
  const visibleLog = showAll ? log : log.slice(0, LOG_PREVIEW);

  return (
    <div className="split">
      <div className="stack-lg">
        <MatchSummaryCard match={match} />
        {match.status === 'completed' && <ResultBanner winnerId={snap.winnerId} players={players} match={match} />}

        <Panel title="Players" bare>
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

        {live ? (
          <div className={styles.controls}>
            <Button variant="secondary" disabled aria-describedby="controls-note">
              End Match
            </Button>
            <Button disabled aria-describedby="controls-note">
              Next Turn
            </Button>
            <p id="controls-note" className={styles.controlsNote}>
              Scoring controls arrive with live gameplay in the next phase.
            </p>
          </div>
        ) : (
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

      <Panel title="Game Log">
        <ol className={`list-reset ${styles.log}`} id="game-log">
          {visibleLog.map((entry) => (
            <li key={entry.id} className={`${styles.logItem} ${styles[entry.tone]}`}>
              {entry.playerId ? (
                <Avatar player={players.get(entry.playerId)} size={28} />
              ) : (
                <span className={styles.logIcon} aria-hidden="true">
                  <Flag size={16} />
                </span>
              )}
              <span className={styles.logText}>{entry.text}</span>
              <time className={styles.logTime} dateTime={entry.at}>
                {live ? timeAgo(entry.at) : formatDateTime(entry.at).split(' · ')[1]}
              </time>
            </li>
          ))}
        </ol>
        {log.length > LOG_PREVIEW && (
          <Button variant="ghost" block aria-controls="game-log" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Show latest only' : `Show full log (${log.length} entries)`}
          </Button>
        )}
      </Panel>
    </div>
  );
}

function ResultBanner({ winnerId, players, match }: { winnerId: string | null; players: PlayerDirectory; match: Match }) {
  const youWon = winnerId === players.me.id;
  const headline = winnerId === null ? 'It’s a draw!' : youWon ? 'You win!' : `${players.get(winnerId).username} wins!`;
  const others = match.playerIds.filter((id) => id !== winnerId).map((id) => players.get(id).username);
  return (
    <div className={`${styles.banner} ${youWon ? styles.bannerWin : ''}`}>
      <Splat className={styles.bannerSplat} size={160} color={youWon ? 'rgba(214,255,85,.18)' : 'rgba(175,160,255,.16)'} />
      <CrownSticker size={44} color={youWon ? 'var(--lime)' : 'var(--purple)'} />
      <p className={`${styles.bannerText} marker`}>{headline}</p>
      <p className={styles.bannerSub}>
        {winnerId ? `Beat ${joinNames(others)}` : 'Dead heat'} · {formatDateTime(match.endedAt ?? match.startedAt)}
      </p>
    </div>
  );
}
