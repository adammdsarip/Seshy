import styles from './SkateparkBackdrop.module.css';

/**
 * Atmospheric skatepark silhouettes: skyline, palms, a quarter pipe, a rail
 * over stairs and a bowl. It's decorative, low-contrast and sits behind all
 * content. `launch` is the larger, moodier version used on the launch screen.
 */
export function SkateparkBackdrop({ variant = 'app' }: { variant?: 'app' | 'launch' }) {
  return (
    <div className={`${styles.backdrop} ${styles[variant]}`} aria-hidden="true">
      <div className={styles.glow} />
      <svg className={styles.scene} viewBox="0 0 900 640" preserveAspectRatio="xMidYMax meet" focusable="false">
        <defs>
          <g id="palm">
            <path d="M0 0 C6 -60 4 -120 18 -190" className={styles.trunk} />
            <g transform="translate(18 -190)" className={styles.fronds}>
              <path d="M0 0 C-30 -26 -64 -20 -92 6" />
              <path d="M0 0 C-22 -40 -52 -52 -84 -42" />
              <path d="M0 0 C6 -44 -4 -70 -26 -92" />
              <path d="M0 0 C30 -40 60 -48 90 -34" />
              <path d="M0 0 C34 -22 66 -16 96 10" />
              <path d="M0 0 C-14 -10 -40 14 -58 40" />
              <path d="M0 0 C18 -6 46 20 58 46" />
            </g>
          </g>
        </defs>

        {/* far skyline */}
        <g className={styles.far}>
          <rect x="40" y="410" width="46" height="230" />
          <rect x="92" y="380" width="34" height="260" />
          <rect x="132" y="430" width="58" height="210" />
          <rect x="560" y="400" width="40" height="240" />
          <rect x="606" y="360" width="30" height="280" />
          <rect x="642" y="420" width="64" height="220" />
          <rect x="712" y="390" width="38" height="250" />
        </g>

        {/* palms */}
        <g className={styles.palms}>
          <use href="#palm" transform="translate(120 640) scale(1.1)" />
          <use href="#palm" transform="translate(780 640) scale(0.95) scale(-1 1) translate(0 0)" />
          <use href="#palm" transform="translate(860 640) scale(0.7)" />
        </g>

        {/* quarter pipe */}
        <path className={styles.park} d="M0 640 V470 H46 C46 560 110 604 250 610 V640 Z" />
        <path className={styles.edge} d="M0 470 H46" />

        {/* stair set + rail */}
        <g className={styles.park}>
          <rect x="330" y="590" width="60" height="50" />
          <rect x="390" y="570" width="60" height="70" />
          <rect x="450" y="550" width="60" height="90" />
          <rect x="510" y="530" width="64" height="110" />
        </g>
        <g className={styles.edge} fill="none">
          <path d="M318 556 L590 484" />
          <path d="M350 552 V590 M430 531 V570 M510 510 V550 M580 486 V530" />
        </g>

        {/* bowl */}
        <path className={styles.park} d="M640 640 V576 C640 618 680 628 740 628 C800 628 840 618 840 576 V640 Z" />
        <path className={styles.edge} d="M628 576 H648 M832 576 H852" />
      </svg>
      <div className={styles.grain} />
    </div>
  );
}
