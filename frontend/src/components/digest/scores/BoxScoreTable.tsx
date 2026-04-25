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

function PlayerRow({
  player,
  labels,
}: {
  player: TeamPlayerStats['players'][0];
  labels: string[];
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
        <TableCell key={i} className="text-body-sm tabular-nums text-on-surface text-center whitespace-nowrap">
          {player.stats[i] ?? '—'}
        </TableCell>
      ))}
    </TableRow>
  );
}

function TeamBoxScore({
  teamStats,
}: {
  teamStats: TeamPlayerStats;
}) {
  const starters = teamStats.players.filter(p => p.starter);
  const bench = teamStats.players.filter(p => !p.starter && p.stats.length > 0);
  const dnp = teamStats.players.filter(p => !p.starter && p.stats.length === 0);

  return (
    <div className="flex flex-col gap-component">
      {/* Team header */}
      <div className="flex items-center gap-component">
        <span className="text-body-sm text-on-surface font-medium">
          {teamStats.abbreviation || teamStats.team}
        </span>
      </div>

      {/* Stats table */}
      <div className="overflow-x-auto scrollbar-none rounded-card border border-outline-subtle">
        <Table size="sm">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Player</TableHead>
              {teamStats.labels.map((label) => (
                <TableHead key={label} className="text-center whitespace-nowrap">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Starters */}
            {starters.map((player) => (
              <PlayerRow key={player.name} player={player} labels={teamStats.labels} />
            ))}

            {/* Bench separator */}
            {starters.length > 0 && bench.length > 0 && (
              <TableRow>
                <TableCell
                  className="bg-inherit text-label-sm text-on-surface-variant font-medium py-component-compact border-t border-b border-outline-subtle"
                  colSpan={teamStats.labels.length + 1}
                >
                  Bench
                </TableCell>
              </TableRow>
            )}

            {/* Bench */}
            {bench.map((player) => (
              <PlayerRow key={player.name} player={player} labels={teamStats.labels} />
            ))}
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

export function BoxScoreTable({
  playerStats,
  sport,
}: {
  playerStats: TeamPlayerStats[];
  sport: string;
}) {
  if (playerStats.length === 0) return null;

  return (
    <div className="flex flex-col gap-section">
      {playerStats.map((team) => (
        <TeamBoxScore key={team.team} teamStats={team} />
      ))}
    </div>
  );
}
