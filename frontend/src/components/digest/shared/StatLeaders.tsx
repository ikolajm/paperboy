'use client';

import type { TeamPlayerStats, GameLeader } from '@/types';
import { ensureContrast } from './color';

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
  ],
};

// --- Derive leader from box score ---

interface DerivedLeader {
  name: string;
  athleteId?: string;
  headshot?: string;
  jersey?: string;
  position?: string;
  value: string;
}

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
    if (!raw || raw === '0' || raw.includes(':')) continue; // skip zero, time values (TOI)
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

// --- Headshot URL ---

function headshotUrl(sport: string, athleteId: string): string {
  return `https://a.espncdn.com/i/headshots/${sport.toLowerCase()}/players/full/${athleteId}.png`;
}

// --- Player half card ---

function PlayerHalf({
  side,
  leader,
  abbr,
  teamColor,
  teamLogo,
  sport,
}: {
  side: 'away' | 'home';
  leader: DerivedLeader | null;
  abbr: string;
  teamColor: string;
  teamLogo: string;
  sport: string;
}) {
  const isAway = side === 'away';

  if (!leader) {
    return (
      <div
        className="flex-1 flex items-center justify-center py-section"
        style={{ backgroundColor: `#${teamColor}80` }}
      >
        <span className="text-body-sm text-on-surface-variant">—</span>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 relative overflow-hidden ${isAway ? 'rounded-l-card' : 'rounded-r-card'}`}
      style={{ backgroundColor: `#${teamColor}80` }}
    >
      {/* Team logo watermark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={teamLogo}
        alt=""
        className={`absolute opacity-10 size-[80px] ${isAway ? 'left-1 top-1' : 'right-1 top-1'}`}
      />

      {/* Content */}
      <div className={`relative z-[1] flex flex-col items-center gap-component-compact px-group py-component ${isAway ? '' : ''}`}>
        {/* Player headshot */}
        {(leader.headshot || leader.athleteId) && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={leader.headshot ?? headshotUrl(sport, leader.athleteId!)}
            alt={leader.name}
            className="size-[56px] md:size-[64px] object-contain"
          />
        )}

        {/* Stat value */}
        <div className="flex flex-col items-center">
          <span className="text-title-lg text-white font-medium tabular-nums">
            {leader.value}
          </span>
          <span className="text-label-sm text-white/60">{abbr}</span>
        </div>

        {/* Player name */}
        <span className="text-label-sm text-white/80 text-center truncate max-w-full">
          {leader.name}
        </span>
      </div>
    </div>
  );
}

// --- Matchup card for one stat category ---

function LeaderMatchupCard({
  category,
  awayLeader,
  homeLeader,
  awayColor,
  homeColor,
  awayLogo,
  homeLogo,
  sport,
}: {
  category: { label: string; abbr: string };
  awayLeader: DerivedLeader | null;
  homeLeader: DerivedLeader | null;
  awayColor: string;
  homeColor: string;
  awayLogo: string;
  homeLogo: string;
  sport: string;
}) {
  return (
    <div className="flex flex-col shrink-0 w-[280px] md:w-[320px]">
      {/* Category label */}
      <div className="flex justify-center mb-component-compact">
        <span className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">
          {category.label}
        </span>
      </div>

      {/* Player comparison */}
      <div className="flex rounded-card overflow-hidden">
        <PlayerHalf
          side="away"
          leader={awayLeader}
          abbr={category.abbr}
          teamColor={awayColor}
          teamLogo={awayLogo}
          sport={sport}
        />
        <PlayerHalf
          side="home"
          leader={homeLeader}
          abbr={category.abbr}
          teamColor={homeColor}
          teamLogo={homeLogo}
          sport={sport}
        />
      </div>
    </div>
  );
}

// --- Main export ---

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
}) {
  const categories = STAT_CATEGORIES[sport] ?? STAT_CATEGORIES.NBA;
  const safeAway = ensureContrast(awayColor, awayAlternateColor) ?? '778880';
  const safeHome = ensureContrast(homeColor, homeAlternateColor) ?? '778880';

  // Split game leaders into away (first half) and home (second half)
  const halfLen = Math.floor(gameLeaders.length / 2);
  const awayGameLeaders = gameLeaders.slice(0, halfLen);
  const homeGameLeaders = gameLeaders.slice(halfLen);

  const matchups = categories.map((cat) => {
    // Try box score first (has more categories), fall back to game leaders
    let awayLeader: DerivedLeader | null = null;
    let homeLeader: DerivedLeader | null = null;

    if (playerStats && playerStats.length >= 2) {
      awayLeader = findLeaderInBoxScore(playerStats[0], cat.key);
      homeLeader = findLeaderInBoxScore(playerStats[1], cat.key);
    }

    // Cross-reference game leaders for athleteId (box score players don't always have it)
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

    // Fall back to game leaders if box score didn't have this category
    if (!awayLeader) awayLeader = findLeaderFromGameLeaders(awayGameLeaders, cat.key);
    if (!homeLeader) homeLeader = findLeaderFromGameLeaders(homeGameLeaders, cat.key);

    return { cat, awayLeader, homeLeader };
  }).filter(m => m.awayLeader || m.homeLeader);

  if (matchups.length === 0) return null;

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Stat Leaders</span>
      <div className="flex gap-group overflow-x-auto scrollbar-none pb-component">
        {matchups.map(({ cat, awayLeader, homeLeader }) => (
          <LeaderMatchupCard
            key={cat.key}
            category={cat}
            awayLeader={awayLeader}
            homeLeader={homeLeader}
            awayColor={safeAway}
            homeColor={safeHome}
            awayLogo={awayLogo}
            homeLogo={homeLogo}
            sport={sport}
          />
        ))}
      </div>
    </div>
  );
}
