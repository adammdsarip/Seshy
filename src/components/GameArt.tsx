import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { GAME_LABELS, type GameType } from '../domain/types';
import { CrownSticker, DiceSticker, Splat } from './Stickers';
import styles from './GameArt.module.css';

export const GAME_TAGLINES: Record<GameType, string> = {
  'skate-dice': 'Random tricks. Real progression.',
  skate: 'Classic rules. Challenge your friends.',
};

const tone = (game: GameType) => (game === 'skate-dice' ? styles.orange : styles.purple);

export function GameIcon({ game, size = 40 }: { game: GameType; size?: number }) {
  return game === 'skate-dice' ? (
    <DiceSticker size={size} color="var(--on-accent)" />
  ) : (
    <CrownSticker size={size} color="var(--on-accent)" />
  );
}

/** Small square tile used in lists instead of a photo. */
export function GameThumb({ game, size = 56 }: { game: GameType; size?: number }) {
  return (
    <span className={`${styles.thumb} ${tone(game)}`} style={{ width: size, height: size }} aria-hidden="true">
      <Splat className={styles.thumbSplat} size={size} color="rgba(23,25,28,.14)" />
      <GameIcon game={game} size={size * 0.55} />
    </span>
  );
}

interface CardProps {
  game: GameType;
  to: string;
  /** `tile` is the square card on Play; `wide` is the full-width row on Home. */
  layout?: 'tile' | 'wide';
  footer?: ReactNode;
}

export function GameCard({ game, to, layout = 'tile', footer }: CardProps) {
  return (
    <Link to={to} className={`${styles.card} ${styles[layout]} ${tone(game)}`}>
      <Splat className={styles.cardSplat} size={140} color="rgba(23,25,28,.12)" />
      <span className={styles.cardIcon}>
        <GameIcon game={game} size={layout === 'tile' ? 52 : 40} />
      </span>
      <span className={styles.cardText}>
        <span className={`${styles.cardTitle} display`}>{GAME_LABELS[game]}</span>
        <span className={styles.cardTagline}>{GAME_TAGLINES[game]}</span>
        {footer}
      </span>
      {layout === 'wide' && (
        <span className={styles.arrow} aria-hidden="true">
          <ArrowRight size={18} />
        </span>
      )}
    </Link>
  );
}
