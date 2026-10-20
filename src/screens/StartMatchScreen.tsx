import { Lock, Smartphone, Wifi } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Button } from '../components/Button';
import { GameIcon, GAME_TAGLINES } from '../components/GameArt';
import { ScreenHeader } from '../components/ScreenHeader';
import { GAME_LABELS, type GameType } from '../domain/types';
import styles from './StartMatchScreen.module.css';

const RULES: Record<GameType, string[]> = {
  skate: [
    'The setter calls and lands a trick. Everyone else has to match it.',
    'Miss a match and you take the next letter of S-K-A-T-E.',
    'Miss your own set and the set passes on.',
    'Five letters and you’re out. Last skater standing wins.',
  ],
  'skate-dice': [
    'Roll the dice for a random stance and trick.',
    'Land it to score its difficulty: 1, 2 or 3 points.',
    'Everyone rolls once per round for five rounds.',
    'Most points wins. Tied? Most landed tricks wins.',
  ],
};

const GAMES: GameType[] = ['skate-dice', 'skate'];

export function StartMatchScreen() {
  const [params, setParams] = useSearchParams();
  const selected: GameType = params.get('game') === 'skate' ? 'skate' : 'skate-dice';

  return (
    <>
      <ScreenHeader title="Start a Match" backTo="/play" backLabel="Back to Play" />
      <div className="split">
        <fieldset className={styles.fieldset}>
          <legend className={`${styles.legend} display`}>1. Pick a game</legend>
          <div className={styles.options}>
            {GAMES.map((game) => (
              <label key={game} className={`${styles.option} ${styles[game]} ${selected === game ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="game"
                  value={game}
                  checked={selected === game}
                  onChange={() => setParams({ game }, { replace: true })}
                  className="visually-hidden"
                />
                <GameIcon game={game} size={36} />
                <span className={styles.optionText}>
                  <span className={`${styles.optionTitle} display`}>{GAME_LABELS[game]}</span>
                  <span className={styles.optionSub}>{GAME_TAGLINES[game]}</span>
                </span>
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

        <div className="stack-lg">
          <fieldset className={styles.fieldset} disabled aria-describedby="start-match-note">
            <legend className={`${styles.legend} display`}>2. How are you playing?</legend>
            <div className={styles.modes}>
              <label className={styles.mode}>
                <input type="radio" name="mode" value="pass-and-play" className="visually-hidden" />
                <Smartphone size={22} aria-hidden="true" />
                <span>
                  <strong>Pass &amp; play</strong>
                  <span className={styles.optionSub}>One phone, passed around the session.</span>
                </span>
                <span className={styles.soon}>Next phase</span>
              </label>
              <label className={styles.mode}>
                <input type="radio" name="mode" value="online" className="visually-hidden" />
                <Wifi size={22} aria-hidden="true" />
                <span>
                  <strong>Online</strong>
                  <span className={styles.optionSub}>Everyone scores on their own phone.</span>
                </span>
                <span className={styles.soon}>Next phase</span>
              </label>
            </div>
          </fieldset>

          <div className={styles.note} id="start-match-note">
            <Lock size={18} aria-hidden="true" />
            <p>
              Live scoring isn’t switched on yet. Next up: picking friends, choosing a mode and scoring tricks turn by turn.
              Until then, look around the sample matches.
            </p>
          </div>

          <Button block disabled aria-describedby="start-match-note">
            Start {GAME_LABELS[selected]}
          </Button>
        </div>
      </div>
    </>
  );
}
