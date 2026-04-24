'use client';

import { ensureContrast } from './color';

interface TeamHalfProps {
  side: 'away' | 'home';
  logo: string;
  abbreviation: string;
  record: string;
  seed?: number;
  color?: string;
  alternateColor?: string;
  /** Score to display — omit for scheduled games */
  score?: number;
  /** Whether this team won — only meaningful when score is provided */
  isWinner?: boolean;
  /** Center element (e.g. start time) — rendered between team halves by parent */
}

export function TeamHalf({
  side,
  logo,
  abbreviation,
  record,
  seed,
  color,
  alternateColor,
  score,
  isWinner = false,
}: TeamHalfProps) {
  const isAway = side === 'away';
  const safeColor = ensureContrast(color, alternateColor);
  const hasScore = score !== undefined;

  const teamInfo = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt={abbreviation} className="size-[48px] object-contain shrink-0" />
      <div className={`flex flex-col ${isAway ? '' : 'items-end'}`}>
        <span className={`text-body-md ${hasScore && isWinner ? 'font-medium text-on-surface' : hasScore ? 'text-on-surface-variant' : 'font-medium text-on-surface'}`}>
          {abbreviation}
          {seed != null && <sub className="text-label-sm text-on-surface-variant ml-0.5">{seed}</sub>}
        </span>
        <span className="text-label-sm text-on-surface-variant">{record}</span>
      </div>
    </>
  );

  const scoreEl = hasScore ? (
    <span
      className="text-display-sm tabular-nums"
      style={{ color: isWinner && safeColor ? `#${safeColor}` : 'var(--on-surface-variant)' }}
    >
      {score}
    </span>
  ) : null;

  return (
    <div
      className={`flex-1 flex items-center gap-group px-content py-group ${isAway ? '' : 'justify-end'}`}
      style={{
        background: safeColor
          ? isAway
            ? `linear-gradient(to right, #${safeColor}30, transparent 70%)`
            : `linear-gradient(to left, #${safeColor}30, transparent 70%)`
          : undefined,
      }}
    >
      {isAway ? (
        <>
          <div className="flex flex-col items-center gap-component-compact md:flex-row md:gap-group">
            {teamInfo}
          </div>
          {scoreEl && <div className="ml-auto">{scoreEl}</div>}
        </>
      ) : (
        <>
          {scoreEl && <div className="mr-auto">{scoreEl}</div>}
          <div className="flex flex-col items-center gap-component-compact md:flex-row-reverse md:gap-group">
            {teamInfo}
          </div>
        </>
      )}
    </div>
  );
}
