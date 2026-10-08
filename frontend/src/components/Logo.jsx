import { Link } from 'react-router-dom';
import logoMark from '../assets/brand/aura-logo.svg';
import logoMarkWhite from '../assets/brand/aura-logo-white.svg';

/**
 * AURA brand Logo component.
 *
 * @param {"lockup"|"mark"} variant — "mark" renders only the SVG symbol,
 *   "lockup" renders mark + "AURA" text + optional subtitle.
 * @param {number} size — height of the mark in pixels (default 28).
 * @param {"dark"|"light"} tone — "dark" = teal on light bg, "light" = white on dark/teal bg.
 * @param {boolean} showSubtitle — when true (and variant="lockup"), shows the tagline.
 */
export default function Logo({
  variant = 'lockup',
  size = 28,
  tone = 'dark',
  showSubtitle = false,
}) {
  const src = tone === 'light' ? logoMarkWhite : logoMark;
  const textColor = tone === 'light' ? '#FFFFFF' : '#0F5C5A';
  const subtitleColor = tone === 'light' ? 'rgba(255,255,255,0.72)' : '#5B625F';

  const mark = (
    <img
      src={src}
      alt="AURA"
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0 }}
    />
  );

  if (variant === 'mark') {
    return (
      <Link to="/" aria-label="AURA — Home" className="inline-flex">
        {mark}
      </Link>
    );
  }

  // variant === 'lockup'
  return (
    <Link
      to="/"
      aria-label="AURA — AI-Utilized Readmission Assessment"
      className="inline-flex items-center gap-2.5 no-underline group"
      style={{ textDecoration: 'none' }}
    >
      {mark}
      <div className="flex flex-col" style={{ minWidth: 0 }}>
        <span
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontWeight: 600,
            fontSize: Math.max(16, size * 0.75) + 'px',
            lineHeight: 1.1,
            letterSpacing: '0.06em',
            color: textColor,
            textTransform: 'uppercase',
          }}
        >
          AURA
        </span>
        {showSubtitle && (
          <span
            style={{
              fontFamily: "'Source Sans 3', 'IBM Plex Sans', sans-serif",
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '16px',
              color: subtitleColor,
              marginTop: '2px',
            }}
          >
            AI-Utilized Readmission Assessment
          </span>
        )}
      </div>
    </Link>
  );
}
