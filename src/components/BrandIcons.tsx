/**
 * Seshy's own line icons for the two games. Everything else uses lucide-react.
 * They draw in `currentColor`, so callers colour them with CSS.
 */
interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function CrownIcon({ size = 24, className, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 18 L2.5 7 L8 12 L12 4.5 L16 12 L21.5 7 L21 18 Z" />
      <path d="M4 21 H20" />
    </svg>
  );
}

export function DiceIcon({ size = 24, className, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g transform="rotate(-10 12 12)">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
        <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
        <circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="8.5" cy="15.5" r="1" fill="currentColor" />
        <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
      </g>
    </svg>
  );
}
