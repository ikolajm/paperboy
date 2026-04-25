'use client';

import type { TeamStatsBlock } from '@/types';
import { ensureContrast } from '../shared/color';

// --- Curated stats per sport ---

const CURATED_STATS: Record<string, string[]> = {
  NBA: ['FG%', '3P%', 'FT%', 'REB', 'OR', 'AST', 'STL', 'BLK', 'TO', 'PIP', 'FBPs', 'PF'],
  NHL: ['Goals', 'Assists', 'Points', 'BS', 'HT', 'TK', 'GV', 'FO%', 'PIM', 'SOG', 'TOI'],
  MLB: ['REB', 'OR', 'AST', 'STL', 'BLK', 'TO', 'PF'], // fallback — will refine
  default: [],
};

function parseNumericValue(val: string): number {
  // Handle compound like "40-93" — take first number (made)
  if (val.includes('-')) return parseInt(val.split('-')[0], 10) || 0;
  return parseFloat(val) || 0;
}

function getStatLabel(stat: { abbreviation: string; label: string; name: string }): string {
  return stat.abbreviation || stat.label || stat.name || '?';
}

interface StatRowProps {
  label: string;
  awayValue: string;
  homeValue: string;
  awayNumeric: number;
  homeNumeric: number;
  awayColor: string;
  homeColor: string;
}

function StatRow({ label, awayValue, homeValue, awayNumeric, homeNumeric, awayColor, homeColor }: StatRowProps) {
  const total = awayNumeric + homeNumeric;
  const awayPct = total > 0 ? (awayNumeric / total) * 100 : 50;
  const homePct = total > 0 ? (homeNumeric / total) * 100 : 50;
  const awayWins = awayNumeric > homeNumeric;
  const homeWins = homeNumeric > awayNumeric;

  return (
    <div className="flex flex-col gap-component-compact">
      {/* Values + label */}
      <div className="flex items-center justify-between">
        <span className={`text-body-sm tabular-nums ${awayWins ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
          {awayValue}
        </span>
        <span className="text-body-sm text-on-surface-variant">
          {label}
        </span>
        <span className={`text-body-sm tabular-nums ${homeWins ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
          {homeValue}
        </span>
      </div>
      {/* Bars */}
      <div className="flex gap-0.5 h-2">
        <div
          className="rounded-l-sm transition-all"
          style={{ width: `${awayPct}%`, backgroundColor: `#${awayColor}${awayWins ? '' : '80'}` }}
        />
        <div
          className="rounded-r-sm transition-all"
          style={{ width: `${homePct}%`, backgroundColor: `#${homeColor}${homeWins ? '' : '80'}` }}
        />
      </div>
    </div>
  );
}

export function TeamStatsComparison({
  teamStats,
  awayColor,
  homeColor,
  awayAbbr,
  homeAbbr,
  sport,
}: {
  teamStats: TeamStatsBlock[];
  awayColor?: string;
  homeColor?: string;
  awayAbbr: string;
  homeAbbr: string;
  sport: string;
}) {
  if (teamStats.length < 2) return null;

  const away = teamStats[0];
  const home = teamStats[1];
  const safeAway = ensureContrast(awayColor) ?? '778880';
  const safeHome = ensureContrast(homeColor) ?? '778880';

  // Get curated stat list for this sport, or show all non-empty
  const curatedKeys = CURATED_STATS[sport] ?? CURATED_STATS.default;

  // Build paired stats
  const pairs: { label: string; awayValue: string; homeValue: string; awayNumeric: number; homeNumeric: number }[] = [];
  const seenLabels = new Set<string>();

  for (const awayStat of away.stats) {
    const label = getStatLabel(awayStat);
    if (seenLabels.has(label)) continue; // skip duplicates (e.g. double TECH)
    seenLabels.add(label);

    // If we have a curated list, only show those
    if (curatedKeys.length > 0 && !curatedKeys.includes(label)) continue;

    const homeStat = home.stats.find(s => getStatLabel(s) === label);
    if (!homeStat) continue;

    pairs.push({
      label,
      awayValue: awayStat.displayValue,
      homeValue: homeStat.displayValue,
      awayNumeric: parseNumericValue(awayStat.displayValue),
      homeNumeric: parseNumericValue(homeStat.displayValue),
    });
  }

  if (pairs.length === 0) return null;

  return (
    <div className="flex flex-col gap-group">
      {/* Team headers */}
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-on-surface font-medium">{awayAbbr}</span>
        <span className="text-label-sm text-on-surface-variant">Team Stats</span>
        <span className="text-body-sm text-on-surface font-medium">{homeAbbr}</span>
      </div>
      {/* Stat rows */}
      <div className="flex flex-col gap-component">
        {pairs.map((pair) => (
          <StatRow
            key={pair.label}
            label={pair.label}
            awayValue={pair.awayValue}
            homeValue={pair.homeValue}
            awayNumeric={pair.awayNumeric}
            homeNumeric={pair.homeNumeric}
            awayColor={safeAway}
            homeColor={safeHome}
          />
        ))}
      </div>
    </div>
  );
}
