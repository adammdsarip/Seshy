/**
 * Hand-drawn style sticker graphics. All decorative: aria-hidden by default.
 */
interface ArtProps {
  className?: string;
  size?: number;
  color?: string;
}

export function CrownSticker({ className, size = 40, color = 'var(--lime)' }: ArtProps) {
  return (
    <svg className={className} width={size} height={size * 0.8} viewBox="0 0 60 48" aria-hidden="true" fill="none">
      <path
        d="M6 40 L3 12 L17 24 L29 4 L41 23 L56 10 L52 40 Z"
        stroke={color}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M8 44 Q30 40 51 45" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <circle cx="3" cy="10" r="3" fill={color} />
      <circle cx="29" cy="3" r="3" fill={color} />
      <circle cx="57" cy="8" r="3" fill={color} />
    </svg>
  );
}

export function DiceSticker({ className, size = 44, color = 'var(--offwhite)' }: ArtProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" fill="none">
      <g transform="rotate(-12 24 24)">
        <rect x="6" y="6" width="36" height="36" rx="8" stroke={color} strokeWidth="4" />
        <circle cx="16" cy="16" r="3.2" fill={color} />
        <circle cx="32" cy="16" r="3.2" fill={color} />
        <circle cx="24" cy="24" r="3.2" fill={color} />
        <circle cx="16" cy="32" r="3.2" fill={color} />
        <circle cx="32" cy="32" r="3.2" fill={color} />
      </g>
    </svg>
  );
}

/** A skateboard deck seen from above, tilted like a sticker. */
export function DeckSticker({ className, size = 120 }: ArtProps) {
  return (
    <svg className={className} width={size * 0.42} height={size} viewBox="0 0 50 120" aria-hidden="true">
      <g transform="rotate(14 25 60)">
        <rect x="8" y="4" width="34" height="112" rx="17" fill="var(--surface-3)" stroke="var(--offwhite)" strokeWidth="2.5" />
        <rect x="12" y="8" width="26" height="104" rx="13" fill="#0e0f11" />
        <path d="M14 44 L36 38 M14 56 L36 50 M14 68 L36 62" stroke="var(--lime)" strokeWidth="3" strokeLinecap="round" />
        <text x="25" y="96" textAnchor="middle" fontFamily="var(--font-marker)" fontSize="11" fill="var(--orange)">
          S
        </text>
        {[24, 96].map((y) => (
          <g key={y}>
            <rect x="2" y={y - 3} width="8" height="10" rx="3" fill="var(--purple)" />
            <rect x="40" y={y - 3} width="8" height="10" rx="3" fill="var(--purple)" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Spray-paint splat. */
export function Splat({ className, size = 120, color = 'var(--lime)' }: ArtProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path
        fill={color}
        d="M50 18c7 0 9-10 15-8s1 11 7 14 13-4 15 2-8 8-6 14 12 5 10 11-11 2-13 8 7 11 2 15-10-5-15-1-2 13-8 13-5-11-11-11-9 9-14 5 3-10-2-14-12 1-13-5 9-6 7-12-11-6-8-11 10 1 13-4-3-12 3-14 9 6 14 3-1-9 4-9z"
      />
      <circle cx="88" cy="20" r="4" fill={color} />
      <circle cx="14" cy="82" r="3" fill={color} />
      <circle cx="80" cy="88" r="2.5" fill={color} />
    </svg>
  );
}

/** Little star-burst marks used around empty-state art. */
export function Sparks({ className, color = 'var(--lime)' }: ArtProps) {
  return (
    <svg className={className} width="120" height="40" viewBox="0 0 120 40" aria-hidden="true" fill="none">
      <path d="M10 30 L18 22 M8 18 L16 18 M14 8 L18 14" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M110 30 L102 22 M112 18 L104 18 M106 8 L102 14" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
