import { useState } from 'react';
import { Lock, Minus, Plus, UserPlus } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { GameIcon, GAME_TAGLINES } from '../components/GameArt';
import { ScreenHeader } from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/States';
import { usePlayers } from '../data/DataProvider';
import { GAME_LABELS, type GameType } from '../domain/types';
import { RULES } from './rules';
import styles from './StartMatchScreen.module.css';

const GAMES: GameType[] = ['skate-dice', 'skate'];
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 5;
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 10;

export function StartMatchScreen() {
  const [params, setParams] = useSearchParams();
  const selected: GameType = params.get('game') === 'skate' ? 'skate' : 'skate-dice';
  const players = usePlayers();
  const [invited, setInvited] = useState<string[]>([]);
  const [rounds, setRounds] = useState(5);

  const total = invited.length + 1;
  const ready = total >= MIN_PLAYERS;
  const toggle = (id: string) => setInvited((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <>
      <ScreenHeader title="Start Match" backTo="/play" backLabel="Back to Play" />
      <div className="split">
        <div className="stack-lg">
          <fieldset className={styles.fieldset}>
            <legend className={`${styles.legend} display`}>Game Mode</legend>
            <div className={styles.options}>
              {GAMES.map((game) => (
                <label key={game} className={`${styles.option} ${selected === game ? styles.selected : ''} ${styles[game]}`}>
                  <input
                    type="radio"
                    name="game"
                    value={game}
                    checked={selected === game}
                    onChange={() => setParams({ game }, { replace: true })}
                    className="visually-hidden"
                  />
                  <GameIcon game={game} size={30} />
                  <span className={styles.optionTitle}>{GAME_LABELS[game]}</span>
                  <span className={styles.optionSub}>{GAME_TAGLINES[game]}</span>
                </label>
              ))}
            </div>
            <div className={styles.rules} aria-live="polite">
              <h2 className={styles.rulesTitle}>How {GAME_LABELS[selected]} works</h2>
              <ol>
                {RULES[selected].map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ol>
            </div>
          </fieldset>
        </div>

        <div className="stack-lg">
          <fieldset className={styles.fieldset}>
            <legend className={`${styles.legend} display`}>
              Players ({MIN_PLAYERS}–{MAX_PLAYERS})
            </legend>
            {players.status === 'loading' && <LoadingState label="Loading friends" rows={2} />}
            {players.status === 'error' && <ErrorState error={players.error} onRetry={players.retry} />}
            {players.status === 'success' && (
              <ul className={`list-reset ${styles.players}`}>
                <li className={styles.player}>
                  <Avatar player={players.data.me} size={40} />
                  <span className={styles.playerText}>
                    <strong>{players.data.me.username}</strong>
                    {players.data.me.handle && <span>@{players.data.me.handle}</span>}
                  </span>
                  <span className={styles.host}>Host</span>
                </li>
                {players.data.friends.map((f) => {
                  const on = invited.includes(f.id);
                  const full = !on && total >= MAX_PLAYERS;
                  return (
                    <li key={f.id}>
                      <label className={`${styles.player} ${styles.pick} ${on ? styles.picked : ''} ${full ? styles.full : ''}`}>
                        <input type="checkbox" checked={on} disabled={full} onChange={() => toggle(f.id)} className="visually-hidden" />
                        <Avatar player={f} size={40} />
                        <span className={styles.playerText}>
                          <strong>{f.username}</strong>
                          {f.handle && <span>@{f.handle}</span>}
                        </span>
                        <span className={styles.check} aria-hidden="true">
                          {on ? '✓' : ''}
                        </span>
                      </label>
                    </li>
                  );
                })}
                <li>
                  <div className={`${styles.player} ${styles.addFriend}`} aria-disabled="true">
                    <span className={styles.addIcon}>
                      <UserPlus size={20} aria-hidden="true" />
                    </span>
                    <span className={styles.playerText}>
                      <strong>Add Friend</strong>
                      <span>Invite by code</span>
                    </span>
                    <span className={styles.soon}>Soon</span>
                  </div>
                </li>
              </ul>
            )}
          </fieldset>

          {selected === 'skate-dice' && (
            <fieldset className={styles.fieldset}>
              <legend className={`${styles.legend} display`}>Match Settings</legend>
              <div className={styles.setting}>
                <label htmlFor="rounds-value">Rounds</label>
                <div className={styles.stepper}>
                  <button
                    type="button"
                    className={styles.stepButton}
                    aria-label="Fewer rounds"
                    disabled={rounds <= MIN_ROUNDS}
                    onClick={() => setRounds((r) => Math.max(MIN_ROUNDS, r - 1))}
                  >
                    <Minus size={18} aria-hidden="true" />
                  </button>
                  <output id="rounds-value" aria-live="polite" className={styles.stepValue}>
                    {rounds}
                  </output>
                  <button
                    type="button"
                    className={styles.stepButton}
                    aria-label="More rounds"
                    disabled={rounds >= MAX_ROUNDS}
                    onClick={() => setRounds((r) => Math.min(MAX_ROUNDS, r + 1))}
                  >
                    <Plus size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </fieldset>
          )}

          <div className="stack">
            <p className={styles.summary} aria-live="polite">
              {total} {total === 1 ? 'player' : 'players'} · {GAME_LABELS[selected]}
              {selected === 'skate-dice' ? ` · ${rounds} rounds` : ''}
              {!ready && ' · pick at least one friend'}
            </p>
            <Button block disabled aria-describedby="start-note">
              Start Match
            </Button>
            <div className={styles.note} id="start-note">
              <Lock size={16} aria-hidden="true" />
              <p>Live scoring isn’t switched on yet, so matches can’t be started. It’s the next thing being built.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
