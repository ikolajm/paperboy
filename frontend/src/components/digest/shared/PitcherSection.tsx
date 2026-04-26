'use client';

import { useState } from 'react';
import type { FeaturedPitcher } from '@/types';
import { ensureContrast } from './color';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { NameBar, CardLabel, headshotUrl } from './PlayerCard';

// --- Role display helpers ---

const ROLE_LABELS: Record<string, string> = {
  win: 'Winner',
  loss: 'Loser',
  save: 'Save',
};

const ROLE_LABEL_STYLES: Record<string, string> = {
  win: 'bg-success text-on-success',
  loss: 'bg-error text-on-error',
  save: 'bg-info text-on-info',
};

// --- Single pitcher card — same layout as StatLeaders PlayerHalf ---

function PitcherCard({
  pitcher,
  teamColor,
  teamLogo,
}: {
  pitcher: FeaturedPitcher;
  teamColor: string;
  teamLogo: string;
}) {
  return (
    <div
      className="h-[140px] relative overflow-hidden rounded-card"
      style={{ backgroundColor: `#${teamColor}80` }}
    >
      {/* Team logo watermark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={teamLogo}
        alt=""
        className="absolute opacity-10 size-[120px] right-1 top-1"
      />

      {/* Role label — top center */}
      <CardLabel
        text={ROLE_LABELS[pitcher.role] ?? pitcher.role}
        className={ROLE_LABEL_STYLES[pitcher.role] ?? ''}
      />

      {/* Bottom: headshot + name bar (same as StatLeaders PlayerHalf) */}
      <div className="absolute z-[1] bottom-0 w-full">
        {pitcher.athleteId && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={headshotUrl('mlb', pitcher.athleteId)}
              alt={pitcher.name}
              loading="lazy"
              className="size-[80px] object-cover"
            />
          </div>
        )}
        <NameBar name={pitcher.name} />
      </div>
    </div>
  );
}

// --- Exports ---

/** Grid of individual pitcher cards */
export function PitcherMatchup({
  pitchers,
  awayWon,
  awayColor,
  homeColor,
  awayAlternateColor,
  homeAlternateColor,
  awayLogo,
  homeLogo,
  defaultExpanded = true,
}: {
  pitchers: FeaturedPitcher[];
  awayWon: boolean;
  awayColor?: string;
  homeColor?: string;
  awayAlternateColor?: string;
  homeAlternateColor?: string;
  awayLogo: string;
  homeLogo: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (pitchers.length === 0) return null;

  const safeAway = ensureContrast(awayColor, awayAlternateColor) ?? '778880';
  const safeHome = ensureContrast(homeColor, homeAlternateColor) ?? '778880';

  function getTeamForPitcher(p: FeaturedPitcher) {
    const isAwayTeam = (p.role === 'win' && awayWon) || (p.role === 'loss' && !awayWon) || (p.role === 'save' && awayWon);
    return {
      color: isAwayTeam ? safeAway : safeHome,
      logo: isAwayTeam ? awayLogo : homeLogo,
    };
  }

  // Order: winner first, then loser, then save
  const ordered = [...pitchers].sort((a, b) => {
    const order = { win: 0, loss: 1, save: 2 };
    return (order[a.role] ?? 3) - (order[b.role] ?? 3);
  });

  return (
    <div className="flex flex-col gap-component">
      <button
        className="flex items-center gap-component text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-body-sm text-on-surface font-medium">Pitching</span>
        {expanded ? (
          <ChevronUp className="size-icon-1 text-on-surface-variant" />
        ) : (
          <ChevronDown className="size-icon-1 text-on-surface-variant" />
        )}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-component">
          {ordered.map((p) => {
            const team = getTeamForPitcher(p);
            return (
              <PitcherCard
                key={p.role}
                pitcher={p}
                teamColor={team.color}
                teamLogo={team.logo}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Compact card-level pitcher display — same grid, just for card expanded view */
export function PitcherList({
  pitchers,
  awayWon,
  awayColor,
  homeColor,
  awayAlternateColor,
  homeAlternateColor,
  awayLogo,
  homeLogo,
  defaultExpanded = true,
}: {
  pitchers: FeaturedPitcher[];
  awayWon?: boolean;
  awayColor?: string;
  homeColor?: string;
  awayAlternateColor?: string;
  homeAlternateColor?: string;
  awayLogo?: string;
  homeLogo?: string;
  defaultExpanded?: boolean;
}) {
  if (pitchers.length === 0) return null;

  const hasTeamContext = !!(awayColor && homeColor && awayLogo && homeLogo);

  if (!hasTeamContext) {
    // Plain fallback list
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

  // Delegate to PitcherMatchup for the full card treatment
  return (
    <PitcherMatchup
      pitchers={pitchers}
      awayWon={awayWon ?? false}
      awayColor={awayColor}
      homeColor={homeColor}
      awayAlternateColor={awayAlternateColor}
      homeAlternateColor={homeAlternateColor}
      awayLogo={awayLogo!}
      homeLogo={homeLogo!}
      defaultExpanded={defaultExpanded}
    />
  );
}

/** Legacy alias */
export { PitcherList as PitcherSection };
