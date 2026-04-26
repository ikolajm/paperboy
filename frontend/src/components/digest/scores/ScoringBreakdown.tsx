'use client';

import type { TeamStatsBlock } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ensureContrast } from '../shared/color';

// --- Helpers ---

function parseCompound(val: string): { made: number; attempted: number } {
  const parts = val.split('-');
  if (parts.length === 2) {
    return { made: parseInt(parts[0], 10) || 0, attempted: parseInt(parts[1], 10) || 0 };
  }
  return { made: 0, attempted: 0 };
}

function findStat(stats: TeamStatsBlock['stats'], ...names: string[]): string {
  for (const name of names) {
    const stat = stats.find(s =>
      s.abbreviation === name || s.label === name || s.name === name
    );
    if (stat) return stat.displayValue;
  }
  return '0';
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-component bg-surface-1 border border-outline-subtle px-group py-component text-body-sm">
      {label && <p className="text-on-surface font-medium mb-component-compact">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-component">
          <div className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-on-surface-variant">{entry.name}:</span>
          <span className="text-on-surface font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// --- Shared donut renderer ---

const SEGMENT_OPACITIES = ['', 'B0', '70'];

function DonutPair({
  title,
  teams,
}: {
  title: string;
  teams: Array<{
    abbr: string;
    color: string;
    data: Array<{ name: string; value: number }>;
    centerLabel: string;
    subLabel?: string;
  }>;
}) {
  if (teams.every(t => t.data.length === 0)) return null;

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">{title}</span>
      <div className="flex items-center justify-around">
        {teams.map(({ abbr, color, data, centerLabel, subLabel }) => {
          return (
            <div key={abbr} className="flex flex-col items-center gap-component-compact">
              <span className="text-label-sm text-on-surface-variant">{abbr}</span>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={`#${color}${SEGMENT_OPACITIES[i] ?? ''}`} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <text
                    x="50%"
                    y={subLabel ? '45%' : '50%'}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-body-md font-medium"
                    fill="var(--on-surface)"
                  >
                    {centerLabel}
                  </text>
                  {subLabel && (
                    <text
                      x="50%"
                      y="60%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-label-sm"
                      fill="var(--on-surface-variant)"
                    >
                      {subLabel}
                    </text>
                  )}
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex gap-component text-label-sm text-on-surface-variant">
                {data.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-component-compact">
                    <div className="size-2 rounded-full" style={{ backgroundColor: `#${color}${SEGMENT_OPACITIES[i] ?? ''}` }} />
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- NBA: Scoring breakdown donut ---

function NbaScoringDonut({
  teamStats,
  awayColor,
  homeColor,
  awayAbbr,
  homeAbbr,
}: {
  teamStats: TeamStatsBlock[];
  awayColor: string;
  homeColor: string;
  awayAbbr: string;
  homeAbbr: string;
}) {
  if (teamStats.length < 2) return null;

  function getBreakdown(stats: TeamStatsBlock['stats']) {
    const fg = parseCompound(findStat(stats, 'FG', 'Field Goals'));
    const threes = parseCompound(findStat(stats, '3PT', 'Three Pointers', '3P'));
    const ft = parseCompound(findStat(stats, 'FT', 'Free Throws'));

    const twoPtMade = fg.made - threes.made;
    return [
      { name: '2PT', value: twoPtMade * 2 },
      { name: '3PT', value: threes.made * 3 },
      { name: 'FT', value: ft.made },
    ].filter(d => d.value > 0);
  }

  const awayData = getBreakdown(teamStats[0].stats);
  const homeData = getBreakdown(teamStats[1].stats);

  return (
    <DonutPair
      title="Scoring Breakdown"
      teams={[
        { abbr: awayAbbr, color: awayColor, data: awayData, centerLabel: String(awayData.reduce((s, d) => s + d.value, 0)) },
        { abbr: homeAbbr, color: homeColor, data: homeData, centerLabel: String(homeData.reduce((s, d) => s + d.value, 0)) },
      ]}
    />
  );
}

// --- NHL: Power play donut ---

function NhlPowerPlay({
  teamStats,
  awayColor,
  homeColor,
  awayAbbr,
  homeAbbr,
}: {
  teamStats: TeamStatsBlock[];
  awayColor: string;
  homeColor: string;
  awayAbbr: string;
  homeAbbr: string;
}) {
  if (teamStats.length < 2) return null;

  const awayPPG = parseFloat(findStat(teamStats[0].stats, 'PPG')) || 0;
  const awayPPO = parseFloat(findStat(teamStats[0].stats, 'PPO')) || 0;
  const homePPG = parseFloat(findStat(teamStats[1].stats, 'PPG')) || 0;
  const homePPO = parseFloat(findStat(teamStats[1].stats, 'PPO')) || 0;

  if (awayPPO === 0 && homePPO === 0) return null;

  function ppData(goals: number, opps: number) {
    return [
      { name: 'Goals', value: goals },
      { name: 'Missed', value: Math.max(0, opps - goals) },
    ];
  }

  function pctLabel(goals: number, opps: number) {
    return opps > 0 ? `${((goals / opps) * 100).toFixed(0)}%` : '0%';
  }

  return (
    <DonutPair
      title="Power Play"
      teams={[
        { abbr: awayAbbr, color: awayColor, data: ppData(awayPPG, awayPPO), centerLabel: `${awayPPG}/${awayPPO}`, subLabel: pctLabel(awayPPG, awayPPO) },
        { abbr: homeAbbr, color: homeColor, data: ppData(homePPG, homePPO), centerLabel: `${homePPG}/${homePPO}`, subLabel: pctLabel(homePPG, homePPO) },
      ]}
    />
  );
}

// --- Main export ---

export function ScoringBreakdown({
  teamStats,
  sport,
  awayColor,
  homeColor,
  awayAbbr,
  homeAbbr,
}: {
  teamStats: TeamStatsBlock[];
  sport: string;
  awayColor?: string;
  homeColor?: string;
  awayAbbr: string;
  homeAbbr: string;
}) {
  const safeAway = ensureContrast(awayColor) ?? '778880';
  const safeHome = ensureContrast(homeColor) ?? '778880';

  return (
    <div className="flex flex-col gap-section-compact">
      {sport === 'NBA' && (
        <NbaScoringDonut
          teamStats={teamStats}
          awayColor={safeAway}
          homeColor={safeHome}
          awayAbbr={awayAbbr}
          homeAbbr={homeAbbr}
        />
      )}

      {sport === 'NHL' && (
        <NhlPowerPlay
          teamStats={teamStats}
          awayColor={safeAway}
          homeColor={safeHome}
          awayAbbr={awayAbbr}
          homeAbbr={homeAbbr}
        />
      )}
    </div>
  );
}
