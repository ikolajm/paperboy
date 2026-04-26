'use client';

import type { TeamPlayerStats } from '@/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/atoms/Table';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/atoms/Tabs';
import { ensureContrast } from '../shared/color';
import { getStatGroup } from '../shared/statLabels';

// --- Helpers ---

interface TeamContext {
  abbreviation: string;
  color?: string;
  alternateColor?: string;
}

/** Identify group boundary indices (where offense→defense or defense→other transitions) */
function getGroupBoundaries(sport: string, labels: string[]): Set<number> {
  const boundaries = new Set<number>();
  let prevGroup = '';

  for (let i = 0; i < labels.length; i++) {
    const group = getStatGroup(sport, labels[i]);
    if (prevGroup && group !== prevGroup && i > 0) {
      boundaries.add(i);
    }
    prevGroup = group;
  }

  return boundaries;
}

/** Compute team totals — keeps original label order */
function computeTotals(players: TeamPlayerStats['players'], labels: string[]): (string | null)[] {
  const NON_SUMMABLE = new Set([
    'MIN', 'FG%', '3P%', 'FT%', 'AVG', 'OBP', 'SLG', 'ERA',
    'FO%', '+/-', 'TOI', 'PPTOI', 'SHTOI', 'ESTOI',
  ]);

  return labels.map((label, i) => {
    if (NON_SUMMABLE.has(label)) return null;

    let totalA = 0;
    let totalB = 0;
    let isCompound = false;
    let hasAny = false;

    for (const p of players) {
      const raw = p.stats[i];
      if (!raw || raw === '—') continue;

      // Handle compound values like "9-16" (made-attempted)
      if (raw.includes('-') && !raw.startsWith('-')) {
        const parts = raw.split('-');
        totalA += parseInt(parts[0], 10) || 0;
        totalB += parseInt(parts[1], 10) || 0;
        isCompound = true;
        hasAny = true;
      } else if (!raw.includes(':')) {
        const num = parseFloat(raw);
        if (!isNaN(num)) {
          totalA += num;
          hasAny = true;
        }
      }
    }

    if (!hasAny) return null;
    return isCompound ? `${totalA}-${totalB}` : String(totalA);
  });
}

// --- Player row ---

function PlayerRow({
  player,
  labels,
  boundaries,
}: {
  player: TeamPlayerStats['players'][0];
  labels: string[];
  boundaries: Set<number>;
}) {
  return (
    <TableRow>
      <TableCell className="sticky left-0 z-[1] min-w-[140px] bg-inherit">
        <div className="flex flex-col">
          <span className="text-body-sm text-on-surface font-medium">
            {player.name}
          </span>
          <span className="text-label-sm text-on-surface-variant">
            {[player.position, player.jersey ? `#${player.jersey}` : ''].filter(Boolean).join(' · ')}
          </span>
        </div>
      </TableCell>
      {labels.map((_, i) => (
        <TableCell
          key={i}
          className={`text-body-sm tabular-nums text-on-surface text-center whitespace-nowrap ${
            boundaries.has(i) ? 'border-l border-outline-subtle' : ''
          }`}
        >
          {player.stats[i] ?? '—'}
        </TableCell>
      ))}
    </TableRow>
  );
}

// --- Single team box score ---

function TeamBoxScore({
  teamStats,
  sport,
  teamColor,
}: {
  teamStats: TeamPlayerStats;
  sport: string;
  teamColor: string;
}) {
  const starters = teamStats.players.filter(p => p.starter);
  const bench = teamStats.players.filter(p => !p.starter && p.stats.length > 0);
  const dnp = teamStats.players.filter(p => !p.starter && p.stats.length === 0);
  const activePlayers = [...starters, ...bench];

  const boundaries = getGroupBoundaries(sport, teamStats.labels);
  const totals = computeTotals(activePlayers, teamStats.labels);

  return (
    <div className="flex flex-col gap-component">
      <div className="overflow-x-auto scrollbar-none rounded-card border border-outline-subtle">
        <Table size="sm">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Player</TableHead>
              {teamStats.labels.map((label, i) => (
                <TableHead
                  key={i}
                  className={`text-center whitespace-nowrap ${
                    boundaries.has(i) ? 'border-l border-outline-subtle' : ''
                  }`}
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody
            className="[&_tr:hover]:!bg-[var(--hover-color)]"
            style={{ '--hover-color': `#${teamColor}15` } as React.CSSProperties}
          >
            {/* Starters */}
            {starters.map((player) => (
              <PlayerRow key={player.name} player={player} labels={teamStats.labels} boundaries={boundaries} />
            ))}

            {/* Bench separator */}
            {starters.length > 0 && bench.length > 0 && (
              <TableRow>
                <TableCell
                  className="bg-surface-2 text-label-sm text-on-surface-variant font-medium py-component-compact"
                  colSpan={teamStats.labels.length + 1}
                >
                  Bench
                </TableCell>
              </TableRow>
            )}

            {/* Bench */}
            {bench.map((player) => (
              <PlayerRow key={player.name} player={player} labels={teamStats.labels} boundaries={boundaries} />
            ))}

            {/* Team totals */}
            <TableRow className="bg-surface-2 font-medium">
              <TableCell className="sticky left-0 z-[1] min-w-[140px] bg-inherit">
                <span className="text-body-sm text-on-surface font-medium">Team</span>
              </TableCell>
              {totals.map((val, i) => (
                <TableCell
                  key={i}
                  className={`text-body-sm tabular-nums text-on-surface text-center whitespace-nowrap font-medium ${
                    boundaries.has(i) ? 'border-l border-outline-subtle' : ''
                  }`}
                >
                  {val ?? ''}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* DNP list */}
      {dnp.length > 0 && (
        <span className="text-label-sm text-on-surface-variant">
          DNP: {dnp.map(p => p.name).join(', ')}
        </span>
      )}
    </div>
  );
}

// --- Main export ---

export function BoxScoreTable({
  playerStats,
  sport,
  awayTeam,
  homeTeam,
}: {
  playerStats: TeamPlayerStats[];
  sport: string;
  awayTeam?: TeamContext;
  homeTeam?: TeamContext;
}) {
  if (playerStats.length === 0) return null;

  const awayColor = ensureContrast(awayTeam?.color, awayTeam?.alternateColor) ?? '778880';
  const homeColor = ensureContrast(homeTeam?.color, homeTeam?.alternateColor) ?? '778880';

  const awayLabel = playerStats[0]?.abbreviation || playerStats[0]?.team || 'Away';
  const homeLabel = playerStats[1]?.abbreviation || playerStats[1]?.team || 'Home';

  if (playerStats.length < 2) {
    return <TeamBoxScore teamStats={playerStats[0]} sport={sport} teamColor={awayColor} />;
  }

  return (
    <Tabs defaultValue="away">
      <TabsList>
        <TabsTrigger value="away">{awayLabel}</TabsTrigger>
        <TabsTrigger value="home">{homeLabel}</TabsTrigger>
      </TabsList>

      <TabsContent value="away">
        <div className="py-group">
          <TeamBoxScore teamStats={playerStats[0]} sport={sport} teamColor={awayColor} />
        </div>
      </TabsContent>

      <TabsContent value="home">
        <div className="py-group">
          <TeamBoxScore teamStats={playerStats[1]} sport={sport} teamColor={homeColor} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
