import { ArrowRight, History, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router';
import { Avatar } from '../components/Avatar';
import { GameCard } from '../components/GameArt';
import { Logo } from '../components/Logo';
import { DeckSticker, Splat } from '../components/Stickers';
import { usePlayers, useQuery } from '../data/DataProvider';
import { snapshotMatch } from '../domain/rules';
import { GAME_LABELS } from '../domain/types';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const players = usePlayers();
  const active = useQuery((repo) => repo.getActiveMatch(), []);

  const live = active.status === 'success' && active.data && players.status === 'success' ? active.data : null;
  const leaders = live ? snapshotMatch(live).standings.filter((s) => s.isLeader) : [];

  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-label="Seshy">
        <Splat className={styles.splatA} size={180} color="rgba(214,255,85,.16)" />
        <Splat className={styles.splatB} size={110} color="rgba(255,121,93,.22)" />
        <DeckSticker className={styles.deck} size={150} />
        <div className={styles.heroTop}>
          <h1 className="visually-hidden">Seshy home</h1>
          <Logo size="lg" tagline />
          {players.status === 'success' && (
            <Link to="/profile" className={styles.profileLink} aria-label="Your profile">
              <Avatar player={players.data.me} size={40} />
            </Link>
          )}
        </div>
        <p className={`${styles.shout} marker`}>More tricks. Better friends.</p>
      </section>

      <div className={styles.actions}>
        {live && players.status === 'success' && (
          <Link to="/play/leaderboard/current" className={styles.liveBar}>
            <span className={styles.liveDot} aria-hidden="true" />
            <span className={styles.liveText}>
              <strong>Live: {GAME_LABELS[live.gameType]}</strong>
              <span>
                {leaders.length === 1
                  ? `${players.data.get(leaders[0]!.playerId).username} is leading`
                  : 'Neck and neck'}
                {live.location ? ` · ${live.location}` : ''}
              </span>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        )}

        <GameCard game="skate-dice" to="/play/start?game=skate-dice" layout="wide" />
        <GameCard game="skate" to="/play/start?game=skate" layout="wide" />

        <div className={styles.tiles}>
          <Link to="/play/start" className={styles.tile}>
            <Users size={26} aria-hidden="true" />
            <span className={styles.tileTitle}>Start a Match</span>
            <span className={styles.tileSub}>Play with friends</span>
          </Link>
          <Link to="/play/history" className={styles.tile}>
            <History size={26} aria-hidden="true" />
            <span className={styles.tileTitle}>Match History</span>
            <span className={styles.tileSub}>View past games</span>
          </Link>
        </div>

        <Link to="/play/leaderboard/friends" className={styles.leaderboard}>
          <Trophy size={28} aria-hidden="true" />
          <span className={styles.liveText}>
            <strong className="display">Leaderboard</strong>
            <span>See who’s leading your friends</span>
          </span>
          <span className={styles.arrowDark} aria-hidden="true">
            <ArrowRight size={18} />
          </span>
        </Link>
      </div>
    </div>
  );
}
