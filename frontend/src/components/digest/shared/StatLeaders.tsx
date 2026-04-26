'use client';

import { useState } from 'react';
import type { TeamPlayerStats, GameLeader } from '@/types';
import { ensureContrast } from './color';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { NameBar, CardLabel, headshotUrl } from './PlayerCard';

// --- Sport-specific stat categories to compare ---

const STAT_CATEGORIES: Record<string, { label: string; key: string; abbr: string }[]> = {
  NBA: [
    { label: 'Points', key: 'PTS', abbr: 'PTS' },
    { label: 'Rebounds', key: 'REB', abbr: 'REB' },
    { label: 'Assists', key: 'AST', abbr: 'AST' },
    { label: 'Steals', key: 'STL', abbr: 'STL' },
    { label: 'Blocks', key: 'BLK', abbr: 'BLK' },
  ],
  NHL: [
    { label: 'Goals', key: 'G', abbr: 'G' },
    { label: 'Assists', key: 'A', abbr: 'A' },
    { label: 'Shots on Goal', key: 'SOG', abbr: 'SOG' },
    { label: 'Hits', key: 'HT', abbr: 'HIT' },
    { label: 'Blocked Shots', key: 'BS', abbr: 'BLK' },
  ],
  MLB: [
    { label: 'Hits', key: 'H', abbr: 'H' },
    { label: 'RBI', key: 'RBI', abbr: 'RBI' },
    { label: 'Runs', key: 'R', abbr: 'R' },
    { label: 'Home Runs', key: 'HR', abbr: 'HR' },
    { label: 'Stolen Bases', key: 'SB', abbr: 'SB' },
    { label: 'Strikeouts', key: 'K', abbr: 'K' },
  ],
};

// --- Shared leader interface ---

interface DerivedLeader {
  name: string;
  athleteId?: string;
  headshot?: string;
  jersey?: string;
  position?: string;
  value: string;
}

interface Matchup {
  label: string;
  key: string;
  awayLeader: DerivedLeader | null;
  homeLeader: DerivedLeader | null;
}

// --- Derivation helpers ---

function findLeaderInBoxScore(
  teamStats: TeamPlayerStats,
  statKey: string,
): DerivedLeader | null {
  const labelIndex = teamStats.labels.indexOf(statKey);
  if (labelIndex === -1) return null;

  let bestPlayer: TeamPlayerStats['players'][0] | null = null;
  let bestValue = -Infinity;

  for (const player of teamStats.players) {
    const raw = player.stats[labelIndex];
    if (!raw || raw === '0' || raw.includes(':')) continue;
    const numeric = parseFloat(raw) || 0;
    if (numeric > bestValue) {
      bestValue = numeric;
      bestPlayer = player;
    }
  }

  if (!bestPlayer || bestValue <= 0) return null;

  return {
    name: bestPlayer.name,
    headshot: bestPlayer.headshot,
    jersey: bestPlayer.jersey,
    position: bestPlayer.position,
    value: bestPlayer.stats[labelIndex],
  };
}

function findLeaderFromGameLeaders(
  leaders: GameLeader[],
  statKey: string,
): DerivedLeader | null {
  const leader = leaders.find(l => l.shortName === statKey || l.category === statKey);
  if (!leader) return null;

  return {
    name: leader.athlete,
    athleteId: leader.athleteId,
    jersey: leader.jersey,
    position: leader.position,
    value: leader.displayValue,
  };
}

/** Build matchups from box score + game leaders using sport-specific categories */
function deriveMatchups(
  sport: string,
  playerStats?: TeamPlayerStats[],
  gameLeaders?: GameLeader[],
  awayAbbr?: string,
  homeAbbr?: string,
): Matchup[] {
  const categories = STAT_CATEGORIES[sport] ?? STAT_CATEGORIES.NBA;
  const halfLen = Math.floor((gameLeaders?.length ?? 0) / 2);
  const awayGameLeaders = gameLeaders?.slice(0, halfLen) ?? [];
  const homeGameLeaders = gameLeaders?.slice(halfLen) ?? [];

  // Match playerStats by team abbreviation rather than assuming array order
  const awayStats = playerStats?.find(p => p.abbreviation === awayAbbr) ?? playerStats?.[0];
  const homeStats = playerStats?.find(p => p.abbreviation === homeAbbr) ?? playerStats?.[1];

  return categories.map((cat) => {
    let awayLeader: DerivedLeader | null = null;
    let homeLeader: DerivedLeader | null = null;

    if (awayStats && homeStats) {
      awayLeader = findLeaderInBoxScore(awayStats, cat.key);
      homeLeader = findLeaderInBoxScore(homeStats, cat.key);
    }

    // Cross-reference game leaders for athleteId
    if (awayLeader && !awayLeader.athleteId) {
      const gl = findLeaderFromGameLeaders(awayGameLeaders, cat.key);
      if (gl?.athleteId && gl.name === awayLeader.name) {
        awayLeader.athleteId = gl.athleteId;
      }
    }
    if (homeLeader && !homeLeader.athleteId) {
      const gl = findLeaderFromGameLeaders(homeGameLeaders, cat.key);
      if (gl?.athleteId && gl.name === homeLeader.name) {
        homeLeader.athleteId = gl.athleteId;
      }
    }

    if (!awayLeader) awayLeader = findLeaderFromGameLeaders(awayGameLeaders, cat.key);
    if (!homeLeader) homeLeader = findLeaderFromGameLeaders(homeGameLeaders, cat.key);

    return { label: cat.label, key: cat.key, awayLeader, homeLeader };
  }).filter(m => m.awayLeader || m.homeLeader);
}

/** Leader entry from raw GameLeader[] or SeasonLeader[] (pre-paired, first half away, second half home) */
interface RawLeader {
  category: string;
  shortName: string;
  athlete: string;
  athleteId?: string;
  headshot?: string;
  jersey?: string;
  position?: string;
  displayValue: string;
}

/**
 * Extract a concise stat value from an MLB batting line.
 * ESPN game leaders have full lines like "3-4, HR, 4 RBI, 2 R, K".
 * For BA → return the H-AB ("3-4"), for HR/RBI/R → extract the count.
 */
function extractStatValue(displayValue: string, shortName: string): string {
  // If it doesn't look like a batting line, return as-is
  if (!displayValue.includes(',')) return displayValue;

  // BA: return the H-AB portion (first segment, e.g. "3-4")
  if (shortName === 'BA') {
    return displayValue.split(',')[0].trim();
  }

  // For other stats, find the segment that contains the shortName
  const segments = displayValue.split(',').map(s => s.trim());
  for (const seg of segments) {
    if (seg.includes(shortName)) {
      // Extract leading number ("4 RBI" → "4", "HR" → "1")
      const match = seg.match(/^(\d+)\s/);
      return match ? match[1] : '1';
    }
  }

  return displayValue.split(',')[0].trim();
}

/** Build matchups from raw pre-paired leader arrays (game leaders or season leaders) */
function pairRawLeaders(
  leaders: RawLeader[],
  matchKey: 'shortName' | 'category' = 'shortName',
): Matchup[] {
  const halfLen = Math.floor(leaders.length / 2);
  const awayLeaders = leaders.slice(0, halfLen);
  const homeLeaders = leaders.slice(halfLen);

  return awayLeaders.map((away) => {
    const home = homeLeaders.find((h) => h[matchKey] === away[matchKey]);
    const label = matchKey === 'category' ? away.category : away.shortName;

    const awayValue = away.displayValue.includes(',')
      ? extractStatValue(away.displayValue, away.shortName)
      : away.displayValue;
    const homeValue = home
      ? (home.displayValue.includes(',')
        ? extractStatValue(home.displayValue, home.shortName)
        : home.displayValue)
      : '—';

    return {
      label,
      key: label,
      awayLeader: {
        name: away.athlete,
        athleteId: away.athleteId,
        headshot: away.headshot,
        jersey: away.jersey,
        position: away.position,
        value: awayValue,
      },
      homeLeader: home ? {
        name: home.athlete,
        athleteId: home.athleteId,
        headshot: home.headshot,
        jersey: home.jersey,
        position: home.position,
        value: homeValue,
      } : null,
    };
  }).filter(m => m.awayLeader || m.homeLeader);
}

// --- Player half card ---

function PlayerHalf({
  side,
  leader,
  teamColor,
  teamLogo,
  sport,
}: {
  side: 'away' | 'home';
  leader: DerivedLeader | null;
  teamColor: string;
  teamLogo: string;
  sport: string;
}) {
  const isAway = side === 'away';

  if (!leader) {
    return (
      <div
        className="h-[120px] flex-1 flex items-center justify-center"
        style={{ backgroundColor: `#${teamColor}80` }}
      >
        <span className="text-body-sm text-on-surface-variant">—</span>
      </div>
    );
  }

  return (
    <div
      className={`h-[120px] flex-1 relative overflow-hidden ${isAway ? 'rounded-l-card' : 'rounded-r-card'}`}
      style={{ backgroundColor: `#${teamColor}80` }}
    >
      {/* Team logo watermark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={teamLogo}
        alt=""
        className={`absolute opacity-10 size-[120px] ${isAway ? 'left-1 top-1' : 'right-1 top-1'}`}
      />

      {/* Stat value — vertically centered, offset toward the seam */}
      <div className={`absolute z-[1] top-1/2 -translate-y-1/2 flex flex-col items-center ${isAway ? 'right-[10%]' : 'left-[10%]'}`}>
        <span className="text-title-lg text-white font-medium tabular-nums">
          {leader.value}
        </span>
      </div>

      {/* Bottom: headshot + name bar */}
      <div className="absolute z-[1] bottom-0 w-full">
        {(leader.headshot || leader.athleteId) && (
          <div className={`flex ${isAway ? 'justify-start' : 'justify-end'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={leader.headshot ?? headshotUrl(sport, leader.athleteId!)}
              alt={leader.name}
              loading="lazy"
              className="size-[80px] object-cover"
            />
          </div>
        )}
        <NameBar name={leader.name} />
      </div>
    </div>
  );
}

// --- Matchup card for one stat category ---

function LeaderMatchupCard({
  matchup,
  awayColor,
  homeColor,
  awayLogo,
  homeLogo,
  sport,
}: {
  matchup: Matchup;
  awayColor: string;
  homeColor: string;
  awayLogo: string;
  homeLogo: string;
  sport: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="relative flex rounded-card overflow-hidden">
        <PlayerHalf
          side="away"
          leader={matchup.awayLeader}
          teamColor={awayColor}
          teamLogo={awayLogo}
          sport={sport}

        />
        <PlayerHalf
          side="home"
          leader={matchup.homeLeader}
          teamColor={homeColor}
          teamLogo={homeLogo}
          sport={sport}

        />
        <CardLabel text={matchup.label} />
      </div>
    </div>
  );
}

// --- Collapsible grid wrapper ---

function LeaderGrid({
  matchups,
  title,
  defaultExpanded,
  awayColor,
  homeColor,
  awayLogo,
  homeLogo,
  sport,
}: {
  matchups: Matchup[];
  title: string;
  defaultExpanded: boolean;
  awayColor: string;
  homeColor: string;
  awayLogo: string;
  homeLogo: string;
  sport: string;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (matchups.length === 0) return null;

  return (
    <div className="flex flex-col gap-component">
      <button
        className="flex items-center gap-component text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-body-sm text-on-surface font-medium">{title}</span>
        {expanded ? (
          <ChevronUp className="size-icon-1 text-on-surface-variant" />
        ) : (
          <ChevronDown className="size-icon-1 text-on-surface-variant" />
        )}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-component">
          {matchups.map((m) => (
            <LeaderMatchupCard
              key={m.key}
              matchup={m}
              awayColor={awayColor}
              homeColor={homeColor}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              sport={sport}
    
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main export: box score / game leader derivation mode ---

export function StatLeaders({
  playerStats,
  gameLeaders,
  sport,
  awayColor,
  homeColor,
  awayAlternateColor,
  homeAlternateColor,
  awayLogo,
  homeLogo,
  awayAbbr,
  homeAbbr,
  defaultExpanded = true,
  title = 'Stat Leaders',
}: {
  playerStats?: TeamPlayerStats[];
  gameLeaders: GameLeader[];
  sport: string;
  awayColor?: string;
  homeColor?: string;
  awayAlternateColor?: string;
  homeAlternateColor?: string;
  awayLogo: string;
  homeLogo: string;
  awayAbbr?: string;
  homeAbbr?: string;
  defaultExpanded?: boolean;
  title?: string;
}) {
  const safeAway = ensureContrast(awayColor, awayAlternateColor) ?? '778880';
  const safeHome = ensureContrast(homeColor, homeAlternateColor) ?? '778880';
  const matchups = deriveMatchups(sport, playerStats, gameLeaders, awayAbbr, homeAbbr);

  return (
    <LeaderGrid
      matchups={matchups}
      title={title}
      defaultExpanded={defaultExpanded}
      awayColor={safeAway}
      homeColor={safeHome}
      awayLogo={awayLogo}
      homeLogo={homeLogo}
      sport={sport}
    />
  );
}

// --- Export: raw pre-paired leaders mode (replaces LeaderComparison) ---

export function LeaderComparison({
  leaders,
  title = 'Game Leaders',
  matchKey = 'shortName',
  sport = 'NBA',
  awayColor,
  homeColor,
  awayAlternateColor,
  homeAlternateColor,
  awayLogo,
  homeLogo,
  defaultExpanded = true,
}: {
  leaders: RawLeader[];
  title?: string;
  matchKey?: 'shortName' | 'category';
  sport?: string;
  awayColor?: string;
  homeColor?: string;
  awayAlternateColor?: string;
  homeAlternateColor?: string;
  awayLogo?: string;
  homeLogo?: string;
  defaultExpanded?: boolean;
}) {
  const safeAway = ensureContrast(awayColor, awayAlternateColor) ?? '778880';
  const safeHome = ensureContrast(homeColor, homeAlternateColor) ?? '778880';
  const matchups = pairRawLeaders(leaders, matchKey);

  return (
    <LeaderGrid
      matchups={matchups}
      title={title}
      defaultExpanded={defaultExpanded}
      awayColor={safeAway}
      homeColor={safeHome}
      awayLogo={awayLogo ?? ''}
      homeLogo={homeLogo ?? ''}
      sport={sport}
    />
  );
}
