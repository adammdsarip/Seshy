import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { GAME_LABELS, type GameType } from '../domain/types';
import { CrownIcon, DiceIcon } from './BrandIcons';
import styles from './GameArt.module.css';

export const GAME_TAGLINES: Record<GameType, string> = {
  'skate-dice': 'Random tricks. Real progression.',
  skate: 'Classic rules. Challenge your friends.',
};

const tone = (game: GameType) => (game === 'skate-dice' ? styles.cyan : styles.volt);

export function GameIcon({ game, size = 24 }: { game: GameType; size?: number }) {
  return game === 'skate-dice' ? <DiceIcon size={size} /> : <CrownIcon size={size} />;
}

/** Small tile used in lists: the game's icon in its accent colour. */
export function GameThumb({ game, size = 44 }: { game: GameType; size?: number }) {
  return (
    <span className={`${styles.thumb} ${styles[`thumb-${game}`]}`} style={{ width: size, height: size }} aria-hidden="true">
      <GameIcon game={game} size={size * 0.55} />
    </span>
  );
}

/** Quarter pipe + rail, drawn faint in the corner of a game card. */
function CardScene() {
  return (
    <svg className={styles.scene} viewBox="0 0 200 120" aria-hidden="true" focusable="false">
      <path d="M200 120 V50 H178 C178 98 150 116 100 118 V120 Z" fill="currentColor" />
      <path d="M20 96 L120 66 M34 94 V112 M72 82 V104 M110 69 V96" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

interface CardProps {
  game: GameType;
  to: string;
  /** `tile`: compact square card (Home). `banner`: full-width card (Play). */
  layout?: 'tile' | 'banner';
  footer?: ReactNode;
}

export function GameCard({ game, to, layout = 'tile', footer }: CardProps) {
  return (
    <Link to={to} className={`${styles.card} ${styles[layout]} ${tone(game)}`}>
      <CardScene />
      <span className={styles.cardIcon}>
        <GameIcon game={game} size={layout === 'tile' ? 40 : 44} />
      </span>
      <span className={styles.cardText}>
        <span className={`${styles.cardTitle} display`}>{GAME_LABELS[game]}</span>
        <span className={styles.cardTagline}>{GAME_TAGLINES[game]}</span>
        {footer}
      </span>
      <span className={styles.arrow} aria-hidden="true">
        <ArrowRight size={18} />
      </span>
    </Link>
  );
}
