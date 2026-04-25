'use client';

import type { TeamStatsBlock } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
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

// --- Chart theme (dark mode compatible) ---

const CHART_THEME = {
  tooltipBg: 'var(--surface-1)',
  tooltipBorder: 'var(--outline-subtle)',
  tooltipText: 'var(--on-surface)',
  gridStroke: 'var(--outline-subtle)',
  axisText: 'var(--on-surface-variant)',
};

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
    const twoPtPts = twoPtMade * 2;
    const threePtPts = threes.made * 3;
    const ftPts = ft.made;

    return [
      { name: '2PT', value: twoPtPts },
      { name: '3PT', value: threePtPts },
      { name: 'FT', value: ftPts },
    ].filter(d => d.value > 0);
  }

  const awayData = getBreakdown(teamStats[0].stats);
  const homeData = getBreakdown(teamStats[1].stats);

  if (awayData.length === 0 && homeData.length === 0) return null;

  const SEGMENT_OPACITIES = ['', 'B0', '70']; // full, 70%, 44%

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Scoring Breakdown</span>
      <div className="flex items-center justify-around">
        {[
          { data: awayData, color: awayColor, abbr: awayAbbr },
          { data: homeData, color: homeColor, abbr: homeAbbr },
        ].map(({ data, color, abbr }) => {
          const total = data.reduce((sum, d) => sum + d.value, 0);
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
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-body-md font-medium"
                    fill="var(--on-surface)"
                  >
                    {total}
                  </text>
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

// --- NBA: Shooting efficiency bars ---

function NbaShootingEfficiency({
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

  const categories = ['FG%', '3P%', 'FT%'];
  const data = categories.map(cat => {
    const awayVal = parseFloat(findStat(teamStats[0].stats, cat)) || 0;
    const homeVal = parseFloat(findStat(teamStats[1].stats, cat)) || 0;
    return { name: cat, [awayAbbr]: awayVal, [homeAbbr]: homeVal };
  });

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Shooting Efficiency</span>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ left: 30, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-subtle)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} tickLine={false} axisLine={false} width={35} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--surface-1)' }} />
          <Bar dataKey={awayAbbr} fill={`#${awayColor}`} radius={[0, 2, 2, 0]} barSize={12} />
          <Bar dataKey={homeAbbr} fill={`#${homeColor}`} radius={[0, 2, 2, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Period scoring bar chart (NHL / generic) ---

function PeriodScoringChart({
  linescores,
  sport,
  awayColor,
  homeColor,
  awayAbbr,
  homeAbbr,
}: {
  linescores: { home: number[]; away: number[] };
  sport: string;
  awayColor: string;
  homeColor: string;
  awayAbbr: string;
  homeAbbr: string;
}) {
  const len = Math.max(linescores.home.length, linescores.away.length);
  if (len === 0) return null;

  const labels = sport === 'NHL'
    ? Array.from({ length: len }, (_, i) => i < 3 ? `P${i + 1}` : i === 3 ? 'OT' : 'SO')
    : sport === 'MLB'
      ? Array.from({ length: len }, (_, i) => `${i + 1}`)
      : Array.from({ length: len }, (_, i) => `Q${i + 1}`);

  const data = labels.map((label, i) => ({
    name: label,
    [awayAbbr]: linescores.away[i] ?? 0,
    [homeAbbr]: linescores.home[i] ?? 0,
  }));

  const title = sport === 'NHL' ? 'Goals by Period' : sport === 'MLB' ? 'Runs by Inning' : 'Points by Quarter';

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">{title}</span>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-subtle)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} width={25} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--surface-1)' }} />
          <Bar dataKey={awayAbbr} fill={`#${awayColor}`} radius={[2, 2, 0, 0]} barSize={16} />
          <Bar dataKey={homeAbbr} fill={`#${homeColor}`} radius={[2, 2, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- NHL: Key stats comparison ---

function NhlStatsComparison({
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

  const categories = [
    { key: 'S', label: 'Shots' },
    { key: 'HT', label: 'Hits' },
    { key: 'BS', label: 'Blocked Shots' },
    { key: 'TK', label: 'Takeaways' },
    { key: 'FO%', label: 'Faceoff %' },
  ];

  const data = categories.map(({ key, label }) => {
    const awayVal = parseFloat(findStat(teamStats[0].stats, key)) || 0;
    const homeVal = parseFloat(findStat(teamStats[1].stats, key)) || 0;
    return { name: label, [awayAbbr]: awayVal, [homeAbbr]: homeVal };
  }).filter(d => (d[awayAbbr] as number) > 0 || (d[homeAbbr] as number) > 0);

  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Key Stats</span>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 60, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-subtle)" horizontal={false} />
          <XAxis type="number" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--surface-1)' }} />
          <Bar dataKey={awayAbbr} fill={`#${awayColor}`} radius={[0, 2, 2, 0]} barSize={10} />
          <Bar dataKey={homeAbbr} fill={`#${homeColor}`} radius={[0, 2, 2, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- NHL: Power play ---

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

  const data = [
    { name: awayAbbr, Goals: awayPPG, Opportunities: awayPPO - awayPPG },
    { name: homeAbbr, Goals: homePPG, Opportunities: homePPO - homePPG },
  ];

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Power Play</span>
      <div className="flex items-center justify-around text-body-sm">
        <div className="flex flex-col items-center gap-component-compact">
          <span className="text-on-surface-variant">{awayAbbr}</span>
          <span className="text-title-md text-on-surface font-medium">{awayPPG}/{awayPPO}</span>
          <span className="text-label-sm text-on-surface-variant">
            {awayPPO > 0 ? `${((awayPPG / awayPPO) * 100).toFixed(0)}%` : '0%'}
          </span>
        </div>
        <div className="flex flex-col items-center gap-component-compact">
          <span className="text-on-surface-variant">{homeAbbr}</span>
          <span className="text-title-md text-on-surface font-medium">{homePPG}/{homePPO}</span>
          <span className="text-label-sm text-on-surface-variant">
            {homePPO > 0 ? `${((homePPG / homePPO) * 100).toFixed(0)}%` : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Main export ---

export function ScoringBreakdown({
  teamStats,
  linescores,
  sport,
  awayColor,
  homeColor,
  awayAbbr,
  homeAbbr,
}: {
  teamStats: TeamStatsBlock[];
  linescores?: { home: number[]; away: number[] };
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
      {/* NBA-specific charts */}
      {sport === 'NBA' && (
        <>
          <NbaScoringDonut
            teamStats={teamStats}
            awayColor={safeAway}
            homeColor={safeHome}
            awayAbbr={awayAbbr}
            homeAbbr={homeAbbr}
          />
          <NbaShootingEfficiency
            teamStats={teamStats}
            awayColor={safeAway}
            homeColor={safeHome}
            awayAbbr={awayAbbr}
            homeAbbr={homeAbbr}
          />
        </>
      )}

      {/* NHL-specific charts */}
      {sport === 'NHL' && (
        <>
          <NhlStatsComparison
            teamStats={teamStats}
            awayColor={safeAway}
            homeColor={safeHome}
            awayAbbr={awayAbbr}
            homeAbbr={homeAbbr}
          />
          <NhlPowerPlay
            teamStats={teamStats}
            awayColor={safeAway}
            homeColor={safeHome}
            awayAbbr={awayAbbr}
            homeAbbr={homeAbbr}
          />
        </>
      )}

      {/* Period/inning scoring chart (all sports with linescores) */}
      {linescores && linescores.home.length > 0 && (
        <PeriodScoringChart
          linescores={linescores}
          sport={sport}
          awayColor={safeAway}
          homeColor={safeHome}
          awayAbbr={awayAbbr}
          homeAbbr={homeAbbr}
        />
      )}
    </div>
  );
}
