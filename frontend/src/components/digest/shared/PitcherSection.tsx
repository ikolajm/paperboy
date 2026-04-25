'use client';

import type { FeaturedPitcher } from '@/types';
import { ensureContrast } from './color';

function headshotUrl(athleteId: string): string {
  return `https://a.espncdn.com/i/headshots/mlb/players/full/${athleteId}.png`;
}

function BackgroundLogo({ teamLogo }: { teamLogo: string }){
  {/* eslint-disable-next-line @next/next/no-img-element */}
  {/* Team logo watermark */}
  return <img src={teamLogo} alt="" className="absolute opacity-10 size-[64px] right-0 top-0" />
}

// --- Single pitcher card (used in both card and full page views) ---

function PitcherCard({
  pitcher,
  teamColor,
  teamLogo,
}: {
  pitcher: FeaturedPitcher;
  teamColor: string;
  teamLogo: string;
}) {
  const roleLabel = pitcher.role === 'win' ? 'W' : pitcher.role === 'loss' ? 'L' : 'SV';
  const roleColor = pitcher.role === 'win' ? 'text-success' : pitcher.role === 'loss' ? 'text-error' : 'text-info';

  return (
    <div
      className="relative overflow-hidden rounded-card w-[140px] md:w-[160px] shrink-0"
      style={{ backgroundColor: `#${teamColor}40` }}
    >
      <BackgroundLogo teamLogo={teamLogo} />

      {/* Content */}
      <div className="relative z-[1] flex flex-col items-center gap-component-compact px-group py-component">
        {/* Headshot */}
        {pitcher.athleteId && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={headshotUrl(pitcher.athleteId)}
            alt={pitcher.name}
            className="size-[48px] md:size-[56px] object-contain"
          />
        )}

        {/* Role */}
        <span className={`text-title-lg font-medium ${roleColor}`}>{roleLabel}</span>

        {/* Name + jersey */}
        <span className="text-label-sm text-white/80 text-center truncate max-w-full">
          {pitcher.name}
        </span>

        {/* Record + ERA */}
        {pitcher.record && (
          <span className="text-label-sm text-white/50">
            {pitcher.record}{pitcher.era ? ` · ${pitcher.era} ERA` : ''}
          </span>
        )}
      </div>
    </div>
  );
}

// --- Matchup pair (W vs L side by side, or any two pitchers) ---

function PitcherPair({
  leftPitcher,
  rightPitcher,
  leftColor,
  rightColor,
  leftLogo,
  rightLogo,
  label,
}: {
  leftPitcher: FeaturedPitcher;
  rightPitcher: FeaturedPitcher;
  leftColor: string;
  rightColor: string;
  leftLogo: string;
  rightLogo: string;
  label: string;
}) {
  return (
    <div className="flex flex-col shrink-0 w-[280px] md:w-[320px]">
      <div className="flex justify-center mb-component-compact">
        <span className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex rounded-card overflow-hidden">
        <div className="flex-1 relative overflow-hidden rounded-l-card" style={{ backgroundColor: `#${leftColor}80` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={leftLogo} alt="" className="absolute opacity-10 size-[64px] left-0 top-0" />
          <div className="relative z-[1] flex flex-col items-center gap-component-compact px-group py-component">
            {leftPitcher.athleteId && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={headshotUrl(leftPitcher.athleteId)} alt={leftPitcher.name} className="size-[48px] md:size-[56px] object-contain" />
            )}
            <span className={`text-title-lg font-medium ${leftPitcher.role === 'win' ? 'text-success' : leftPitcher.role === 'loss' ? 'text-error' : 'text-info'}`}>
              {leftPitcher.role === 'win' ? 'W' : leftPitcher.role === 'loss' ? 'L' : 'SV'}
            </span>
            <span className="text-label-sm text-white/80 text-center truncate max-w-full">{leftPitcher.name}</span>
            {leftPitcher.record && (
              <span className="text-label-sm text-white/50">{leftPitcher.record}{leftPitcher.era ? ` · ${leftPitcher.era} ERA` : ''}</span>
            )}
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden rounded-r-card" style={{ backgroundColor: `#${rightColor}80` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={rightLogo} alt="" className="absolute opacity-10 size-[64px] right-0 top-0" />
          <div className="relative z-[1] flex flex-col items-center gap-component-compact px-group py-component">
            {rightPitcher.athleteId && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={headshotUrl(rightPitcher.athleteId)} alt={rightPitcher.name} className="size-[48px] md:size-[56px] object-contain" />
            )}
            <span className={`text-title-lg font-medium ${rightPitcher.role === 'win' ? 'text-success' : rightPitcher.role === 'loss' ? 'text-error' : 'text-info'}`}>
              {rightPitcher.role === 'win' ? 'W' : rightPitcher.role === 'loss' ? 'L' : 'SV'}
            </span>
            <span className="text-label-sm text-white/80 text-center truncate max-w-full">{rightPitcher.name}</span>
            {rightPitcher.record && (
              <span className="text-label-sm text-white/50">{rightPitcher.record}{rightPitcher.era ? ` · ${rightPitcher.era} ERA` : ''}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Exports ---

/** Compact card-level pitcher display — horizontal scroll of uniform cards */
export function PitcherList({
  pitchers,
  awayWon,
  awayColor,
  homeColor,
  awayAlternateColor,
  homeAlternateColor,
  awayLogo,
  homeLogo,
}: {
  pitchers: FeaturedPitcher[];
  awayWon?: boolean;
  awayColor?: string;
  homeColor?: string;
  awayAlternateColor?: string;
  homeAlternateColor?: string;
  awayLogo?: string;
  homeLogo?: string;
}) {
  if (pitchers.length === 0) return null;

  const hasTeamContext = !!(awayColor && homeColor && awayLogo && homeLogo);
  const safeAway = ensureContrast(awayColor, awayAlternateColor) ?? '778880';
  const safeHome = ensureContrast(homeColor, homeAlternateColor) ?? '778880';

  if (!hasTeamContext) {
    // Fallback: plain list
    return (
      <div className="flex flex-col gap-component">
        <span className="text-body-sm text-on-surface font-medium">Pitching</span>
        <div className="flex flex-col gap-component-compact">
          {pitchers.map((p) => (
            <div key={p.role} className="flex items-center gap-component rounded-component bg-surface-1 px-group py-component">
              <span className={`text-body-sm w-8 shrink-0 uppercase font-medium ${p.role === 'win' ? 'text-success' : p.role === 'loss' ? 'text-error' : 'text-info'}`}>
                {p.role === 'win' ? 'W' : p.role === 'loss' ? 'L' : 'SV'}
              </span>
              <span className="text-body-sm text-on-surface font-medium">{p.name}</span>
              {p.record && (
                <span className="text-body-sm text-on-surface ml-auto">
                  {p.record}{p.era ? ` · ${p.era} ERA` : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Team-colored cards on horizontal scroll
  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Pitching</span>
      <div className="flex gap-group overflow-x-auto scrollbar-none pb-component">
        {pitchers.map((p) => {
          // W pitcher belongs to winning team, L to losing team
          const isWinningTeam = (p.role === 'win' && awayWon) || (p.role === 'loss' && !awayWon) || (p.role === 'save' && awayWon);
          const color = isWinningTeam ? safeAway : safeHome;
          const logo = isWinningTeam ? awayLogo! : homeLogo!;
          return <PitcherCard key={p.role} pitcher={p} teamColor={color} teamLogo={logo} />;
        })}
      </div>
    </div>
  );
}

/** Full-page pitcher matchup — W vs L as paired card, save as standalone */
export function PitcherMatchup({
  pitchers,
  awayWon,
  awayColor,
  homeColor,
  awayAlternateColor,
  homeAlternateColor,
  awayLogo,
  homeLogo,
}: {
  pitchers: FeaturedPitcher[];
  awayWon: boolean;
  awayColor?: string;
  homeColor?: string;
  awayAlternateColor?: string;
  homeAlternateColor?: string;
  awayLogo: string;
  homeLogo: string;
}) {
  if (pitchers.length === 0) return null;

  const safeAway = ensureContrast(awayColor, awayAlternateColor) ?? '778880';
  const safeHome = ensureContrast(homeColor, homeAlternateColor) ?? '778880';

  const winPitcher = pitchers.find(p => p.role === 'win');
  const lossPitcher = pitchers.find(p => p.role === 'loss');
  const savePitcher = pitchers.find(p => p.role === 'save');

  const awayPitcher = awayWon ? winPitcher : lossPitcher;
  const homePitcher = awayWon ? lossPitcher : winPitcher;

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Pitching</span>
      <div className="flex gap-group overflow-x-auto scrollbar-none pb-component">
        {/* W vs L matchup */}
        {awayPitcher && homePitcher && (
          <PitcherPair
            leftPitcher={awayPitcher}
            rightPitcher={homePitcher}
            leftColor={safeAway}
            rightColor={safeHome}
            leftLogo={awayLogo}
            rightLogo={homeLogo}
            label="Decision"
          />
        )}
        {/* Save as uniform card */}
        {savePitcher && (
          <PitcherCard
            pitcher={savePitcher}
            teamColor={awayWon ? safeAway : safeHome}
            teamLogo={awayWon ? awayLogo : homeLogo}
          />
        )}
      </div>
    </div>
  );
}

/** Legacy alias */
export { PitcherList as PitcherSection };
