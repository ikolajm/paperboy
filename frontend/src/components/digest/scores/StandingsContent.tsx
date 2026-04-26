'use client';

import { useState } from 'react';
import type { SportStandings, StandingsTeam } from '@/types';
import { Chip } from '@/components/atoms/Chip';
import { EmptyState } from '@/components/atoms/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/atoms/Table';
import { ListOrdered } from 'lucide-react';

// --- Clinch indicator labels ---

const CLINCH_LABELS: Record<string, string> = {
  z: 'Best record',
  y: 'Playoff berth',
  x: 'Playoff berth',
  xp: 'Play-in',
  e: 'Eliminated',
};

function clinchTooltip(clinch: string): string | undefined {
  return CLINCH_LABELS[clinch.toLowerCase()] ?? (clinch || undefined);
}

// --- Record string ---

function recordString(team: StandingsTeam, sport: string): string {
  if (sport === 'NHL' && team.otLosses != null) {
    return `${team.wins}-${team.losses}-${team.otLosses}`;
  }
  return `${team.wins}-${team.losses}`;
}

// --- Standings table for one group (conference/league) ---

function GroupTable({
  groupName,
  teams,
  sport,
}: {
  groupName: string;
  teams: StandingsTeam[];
  sport: string;
}) {
  const showOTL = sport === 'NHL';

  return (
    <div className="flex flex-col gap-component">
      <h4 className="text-body-sm text-on-surface font-medium">{groupName}</h4>
      <div className="overflow-x-auto scrollbar-none rounded-card border border-outline-subtle">
        <Table size="sm">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[40px] text-center">#</TableHead>
              <TableHead className="min-w-[180px]">Team</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">L</TableHead>
              {showOTL && <TableHead className="text-center">OTL</TableHead>}
              <TableHead className="text-center">GB</TableHead>
              <TableHead className="text-center">STRK</TableHead>
              <TableHead className="text-center">DIFF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => {
              const streakWin = team.streak.startsWith('W');
              const diffPositive = team.differential.startsWith('+');

              return (
                <TableRow key={team.abbreviation}>
                  {/* Seed */}
                  <TableCell className="text-center text-body-sm text-on-surface-variant tabular-nums">
                    {team.seed}
                  </TableCell>

                  {/* Team: logo + name + clinch */}
                  <TableCell className="min-w-[180px]">
                    <div className="flex items-center gap-component">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={team.logo}
                        alt={team.abbreviation}
                        loading="lazy"
                        className="size-icon-2 object-contain shrink-0"
                      />
                      <span className="text-body-sm text-on-surface font-medium">
                        {team.displayName}
                      </span>
                      {/* {team.clinch && (
                        <span
                          className="text-label-sm text-on-surface-variant"
                          title={clinchTooltip(team.clinch)}
                        >
                          {team.clinch}
                        </span>
                      )} */}
                    </div>
                  </TableCell>

                  {/* Record */}
                  <TableCell className="text-center text-body-sm tabular-nums">{team.wins}</TableCell>
                  <TableCell className="text-center text-body-sm tabular-nums">{team.losses}</TableCell>
                  {showOTL && (
                    <TableCell className="text-center text-body-sm tabular-nums">{team.otLosses ?? 0}</TableCell>
                  )}

                  {/* Games behind */}
                  <TableCell className="text-center text-body-sm tabular-nums text-on-surface-variant">
                    {team.gamesBehind === '-' ? '—' : team.gamesBehind}
                  </TableCell>

                  {/* Streak */}
                  <TableCell className={`text-center text-body-sm tabular-nums ${streakWin ? 'text-success' : 'text-error'}`}>
                    {team.streak}
                  </TableCell>

                  {/* Differential */}
                  <TableCell className={`text-center text-body-sm tabular-nums ${diffPositive ? 'text-success' : 'text-error'}`}>
                    {team.differential}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- F1 constructor colors (matches pipeline static grid) ---

const F1_CONSTRUCTOR_COLORS: Record<string, string> = {
  'Mercedes': '00D2BE',
  'Ferrari': 'DC0000',
  'McLaren': 'FF8700',
  'Red Bull': '00327D',
  'Haas': '5A5A5A',
  'Racing Bulls': '6692FF',
  'Audi': 'FF2D00',
  'Alpine': 'FFF500',
  'Williams': '64C4FF', // FFFFFF too light for dark theme, use brand blue
  'Aston Martin': '006F62',
  'Cadillac': 'A2AAAD',
};

// Driver→constructor for standings color lookup
const F1_DRIVER_TEAMS: Record<string, string> = {
  'George Russell': 'Mercedes', 'Kimi Antonelli': 'Mercedes',
  'Charles Leclerc': 'Ferrari', 'Lewis Hamilton': 'Ferrari',
  'Lando Norris': 'McLaren', 'Oscar Piastri': 'McLaren',
  'Max Verstappen': 'Red Bull', 'Isack Hadjar': 'Red Bull',
  'Oliver Bearman': 'Haas', 'Esteban Ocon': 'Haas',
  'Arvid Lindblad': 'Racing Bulls', 'Liam Lawson': 'Racing Bulls',
  'Gabriel Bortoleto': 'Audi', 'Nico Hülkenberg': 'Audi',
  'Pierre Gasly': 'Alpine', 'Franco Colapinto': 'Alpine',
  'Alexander Albon': 'Williams', 'Carlos Sainz': 'Williams',
  'Sergio Pérez': 'Cadillac', 'Valtteri Bottas': 'Cadillac',
  'Lance Stroll': 'Aston Martin', 'Fernando Alonso': 'Aston Martin',
};

function getF1Color(name: string, isDriver: boolean): string | undefined {
  if (isDriver) {
    const team = F1_DRIVER_TEAMS[name];
    return team ? F1_CONSTRUCTOR_COLORS[team] : undefined;
  }
  return F1_CONSTRUCTOR_COLORS[name];
}

// --- F1 standings table (rank + color bar + name + points) ---

function F1GroupTable({
  groupName,
  teams,
}: {
  groupName: string;
  teams: StandingsTeam[];
}) {
  const isDrivers = groupName.toLowerCase().includes('driver');

  return (
    <div className="flex flex-col gap-component">
      <h4 className="text-body-sm text-on-surface font-medium">{groupName}</h4>
      <div className="overflow-x-auto scrollbar-none rounded-card border border-outline-subtle">
        <Table size="sm">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[40px] text-center">#</TableHead>
              <TableHead className="min-w-[180px]">{isDrivers ? 'Driver' : 'Constructor'}</TableHead>
              <TableHead className="text-center">PTS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => {
              const color = getF1Color(team.displayName, isDrivers);
              return (
                <TableRow key={team.abbreviation || team.displayName}>
                  <TableCell className="text-center text-body-sm text-on-surface-variant tabular-nums">
                    {team.seed}
                  </TableCell>
                  <TableCell className="min-w-[180px]">
                    <div className="flex items-center gap-component">
                      {color && (
                        <div
                          className="w-[3px] h-[20px] rounded-full shrink-0"
                          style={{ backgroundColor: `#${color}` }}
                        />
                      )}
                      {isDrivers && team.logo && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={team.logo}
                          alt={team.abbreviation}
                          loading="lazy"
                          className="size-icon-1 object-contain shrink-0"
                        />
                      )}
                      <span className="text-body-sm text-on-surface font-medium">
                        {team.displayName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-body-sm tabular-nums font-medium">
                    {team.differential}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- Main export ---

export function StandingsContent({
  standings,
}: {
  standings: SportStandings[];
}) {
  const [activeSport, setActiveSport] = useState<string | null>(null);

  if (standings.length === 0) {
    return (
      <EmptyState
        icon={<ListOrdered />}
        heading="No standings available"
        description="Standings data will appear here."
      />
    );
  }

  const visibleStandings = activeSport
    ? standings.filter((s) => s.sport === activeSport)
    : standings;

  return (
    <div className="flex flex-col gap-section">
      {/* Sport filter chips */}
      <div className="flex flex-wrap gap-component">
        <Chip
          variant={!activeSport ? 'selected' : 'unselected'}
          size="sm"
          onClick={() => setActiveSport(null)}
        >
          All
        </Chip>
        {standings.map((s) => (
          <Chip
            key={s.sport}
            variant={activeSport === s.sport ? 'selected' : 'unselected'}
            size="sm"
            onClick={() => setActiveSport(activeSport === s.sport ? null : s.sport)}
          >
            {s.sport}
          </Chip>
        ))}
      </div>

      {/* Per-sport standings */}
      <div className="flex flex-col gap-section">
        {visibleStandings.map((sportStandings) => (
          <div key={sportStandings.sport} className="flex flex-col gap-group">
            <h3 className="text-title-md text-on-surface">
              {sportStandings.sport === 'F1' ? 'Formula 1' : sportStandings.sport}
            </h3>
            <div className="flex flex-col gap-section-compact">
              {sportStandings.groups.map((group) => (
                sportStandings.sport === 'F1' ? (
                  <F1GroupTable
                    key={group.name}
                    groupName={group.name}
                    teams={group.teams}
                  />
                ) : (
                  <GroupTable
                    key={group.name}
                    groupName={group.name}
                    teams={group.teams}
                    sport={sportStandings.sport}
                  />
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
