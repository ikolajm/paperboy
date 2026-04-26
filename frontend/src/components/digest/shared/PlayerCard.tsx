'use client';

/**
 * Shared building blocks for player cards (stat leaders, pitchers, etc.).
 * Each piece is composable — combine them to create different card layouts.
 */

// --- Team-colored card shell with logo watermark ---

export function CardShell({
  teamColor,
  teamLogo,
  logoPosition = 'right',
  height = 120,
  children,
  className = '',
}: {
  teamColor: string;
  teamLogo: string;
  logoPosition?: 'left' | 'right';
  height?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-card ${className}`}
      style={{ backgroundColor: `#${teamColor}80`, height }}
    >
      {/* Team logo watermark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={teamLogo}
        alt=""
        className={`absolute opacity-10 size-[120px] top-1 ${logoPosition === 'left' ? 'left-1' : 'right-1'}`}
      />
      {children}
    </div>
  );
}

// --- Bottom name bar ---

export function NameBar({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center px-group py-component bg-surface/80 w-full">
      <span className="text-label-md text-on-surface text-center truncate max-w-full">
        {name}
      </span>
    </div>
  );
}

// --- Top-center floating label ---

export function CardLabel({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className="absolute top-[10%] left-0 right-0 flex justify-center pointer-events-none z-[2]">
      <span className={`bg-surface-inverse px-1 py-[2px] rounded-card text-label-md text-on-surface-inverse font-medium uppercase tracking-wider ${className}`}>
        {text}
      </span>
    </div>
  );
}

// --- ESPN headshot URL helper ---

export function headshotUrl(sport: string, athleteId: string): string {
  return `https://a.espncdn.com/i/headshots/${sport.toLowerCase()}/players/full/${athleteId}.png`;
}

// --- Flag backdrop for card headers (F1 circuits, UFC venues) ---

export function FlagBackdrop({
  flagUrl,
  children,
  className = '',
}: {
  flagUrl: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col gap-component-compact px-content py-component overflow-hidden ${className}`}
      style={flagUrl ? { backgroundImage: `url(${flagUrl})`, backgroundSize: '115%', backgroundPosition: 'center' } : undefined}
    >
      {flagUrl && <div className="absolute inset-0 bg-surface-1/90 pointer-events-none" />}
      {children}
    </div>
  );
}

// --- Stat comparison row (team stats, fight stats) ---

export function ComparisonRow({
  label,
  val1,
  val2,
  isLast = false,
  title,
}: {
  label: string;
  val1: string;
  val2: string;
  isLast?: boolean;
  title?: string;
}) {
  const num1 = parseFloat(val1) || 0;
  const num2 = parseFloat(val2) || 0;
  const win1 = num1 > num2;
  const win2 = num2 > num1;

  return (
    <div className={`flex items-center py-component ${isLast ? '' : 'border-b border-outline-subtle'}`} title={title}>
      <span className={`text-body-sm tabular-nums w-[56px] text-left ${win1 ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
        {val1}
      </span>
      <span className="text-label-sm text-on-surface-variant text-center flex-1 select-none">
        {label}
      </span>
      <span className={`text-body-sm tabular-nums w-[56px] text-right ${win2 ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
        {val2}
      </span>
    </div>
  );
}
