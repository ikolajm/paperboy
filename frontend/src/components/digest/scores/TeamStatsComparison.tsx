'use client';

import { useState } from 'react';
import type { TeamStatsBlock } from '@/types';
import { getStatLabel as getFullStatLabel, getStatGroup } from '../shared/statLabels';
import { ComparisonRow } from '../shared/PlayerCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

// --- Curated stats per sport (ordered: offense first, then defense) ---

const CURATED_STATS: Record<string, string[]> = {
  NBA: ['FG%', '3P%', 'FT%', 'REB', 'OR', 'AST', 'STL', 'BLK', 'TO', 'PIP', 'FBPs', 'PF'],
  NHL: ['Goals', 'Assists', 'Points', 'SOG', 'FO%', 'BS', 'HT', 'TK', 'GV', 'PIM'],
  MLB: ['H', 'R', 'HR', 'RBI', 'SB', 'BB', 'LOB', 'SO', 'E'],
  default: [],
};

function parseNumericValue(val: string): number {
  if (val.includes('-')) return parseInt(val.split('-')[0], 10) || 0;
  return parseFloat(val) || 0;
}

function getStatAbbr(stat: { abbreviation: string; label: string; name: string }): string {
  return stat.abbreviation || stat.label || stat.name || '?';
}

interface StatPair {
  label: string;
  fullLabel: string;
  group: string;
  awayValue: string;
  homeValue: string;
  awayNumeric: number;
  homeNumeric: number;
}

// --- Stat table (one group) ---

function StatTable({ title, pairs, awayAbbr, homeAbbr }: {
  title: string;
  pairs: StatPair[];
  awayAbbr: string;
  homeAbbr: string;
}) {
  if (pairs.length === 0) return null;

  return (
    <div className="flex flex-col gap-component">
      <div className="flex items-center">
        <span className="text-body-sm text-on-surface font-medium w-[56px] text-left">{awayAbbr}</span>
        <span className="text-label-sm text-on-surface-variant text-center flex-1">{title}</span>
        <span className="text-body-sm text-on-surface font-medium w-[56px] text-right">{homeAbbr}</span>
      </div>
      <div className="flex flex-col rounded-card border border-outline-subtle overflow-hidden bg-surface-1 px-group">
        {pairs.map((pair, i) => (
          <ComparisonRow key={pair.label} label={pair.label} val1={pair.awayValue} val2={pair.homeValue} isLast={i === pairs.length - 1} title={pair.fullLabel} />
        ))}
      </div>
    </div>
  );
}

// --- Main export ---

export function TeamStatsComparison({
  teamStats,
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
  const [expanded, setExpanded] = useState(true);

  if (teamStats.length < 2) return null;

  const away = teamStats[0];
  const home = teamStats[1];
  const curatedKeys = CURATED_STATS[sport] ?? CURATED_STATS.default;

  // Build pairs
  const allPairs: StatPair[] = [];
  const seenLabels = new Set<string>();

  for (const awayStat of away.stats) {
    const label = getStatAbbr(awayStat);
    if (seenLabels.has(label)) continue;
    seenLabels.add(label);

    if (curatedKeys.length > 0 && !curatedKeys.includes(label)) continue;

    const homeStat = home.stats.find(s => getStatAbbr(s) === label);
    if (!homeStat) continue;

    allPairs.push({
      label,
      fullLabel: getFullStatLabel(sport, label),
      group: getStatGroup(sport, label),
      awayValue: awayStat.displayValue,
      homeValue: homeStat.displayValue,
      awayNumeric: parseNumericValue(awayStat.displayValue),
      homeNumeric: parseNumericValue(homeStat.displayValue),
    });
  }

  if (allPairs.length === 0) return null;

  const offense = allPairs.filter(p => p.group === 'offense');
  const defense = allPairs.filter(p => p.group === 'defense');

  // If grouping didn't split meaningfully, show as single list
  const hasBothGroups = offense.length > 0 && defense.length > 0;

  return (
    <div className="flex flex-col gap-component">
      <button
        className="flex items-center gap-component text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-body-sm text-on-surface font-medium">Team Stats</span>
        {expanded ? (
          <ChevronUp className="size-icon-1 text-on-surface-variant" />
        ) : (
          <ChevronDown className="size-icon-1 text-on-surface-variant" />
        )}
      </button>

      {expanded && (
        hasBothGroups ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-group">
            <StatTable title="Offense" pairs={offense} awayAbbr={awayAbbr} homeAbbr={homeAbbr} />
            <StatTable title="Defense" pairs={defense} awayAbbr={awayAbbr} homeAbbr={homeAbbr} />
          </div>
        ) : (
          <div className="max-w-lg">
            <StatTable title="Team Stats" pairs={allPairs} awayAbbr={awayAbbr} homeAbbr={homeAbbr} />
          </div>
        )
      )}
    </div>
  );
}
