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
