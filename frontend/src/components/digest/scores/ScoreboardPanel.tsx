'use client';

import { useState } from 'react';
import type { ScoresSection } from '@/types';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/atoms/Tabs';
import { Chip } from '@/components/atoms/Chip';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Trophy, Clock, CalendarDays } from 'lucide-react';
import { GameCard } from './GameCard';
import { ScheduledGameCard } from './ScheduledGameCard';
import { F1RecapCard } from './F1RecapCard';
import { F1ScheduleCard } from './F1ScheduleCard';
import { StandingsContent } from './StandingsContent';
import type { F1Weekend, F1Session } from '@/types';

// --- Helpers ---

function sportHeading(sport: string, status: string, seasonType: number): { name: string; modifier?: string } {
  if (seasonType === 3 || status === 'playoffs') {
    return { name: sport, modifier: 'Playoffs' };
  }
  return { name: sport };
}

/** Split F1 weekend sessions into per-day groups using venue-local dates */
function splitF1ByDay(weekend: F1Weekend): { dayLabel: string; modifier: string; sessions: F1Session[] }[] {
  const dayMap = new Map<string, F1Session[]>();

  for (const session of weekend.sessions) {
    if (session.drivers.length === 0) continue;
    const dayKey = session.localDate || session.date?.slice(0, 10) || 'unknown';
    const existing = dayMap.get(dayKey) ?? [];
    existing.push(session);
    dayMap.set(dayKey, existing);
  }

  return Array.from(dayMap.entries()).map(([dayKey, sessions]) => {
    const types = sessions.map(s => s.type);
    const hasRace = types.includes('Race');
    const hasQual = types.includes('Qual');
    const modifier = hasRace ? 'Race Day' : hasQual ? 'Qualifying' : 'Practice';

    const d = new Date(dayKey + 'T12:00:00');
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return { dayLabel, modifier, sessions };
  });
}

function formatRecapDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// --- Main component ---

export function ScoreboardPanel({
  scores,
  date,
}: {
  scores: ScoresSection | null;
  date?: string;
}) {
  if (!scores) {
    return (
      <EmptyState
        icon={<Trophy />}
        heading="No scores available"
        description="Select a date with score data."
      />
    );
  }

  return (
    <Tabs defaultValue="recaps">
      <TabsList>
        <TabsTrigger value="recaps">Recaps</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="standings">Standings</TabsTrigger>
      </TabsList>

      <TabsContent value="recaps">
        <RecapsContent scores={scores} date={date} />
      </TabsContent>

      <TabsContent value="schedule">
        <ScheduleContent scores={scores} date={date} />
      </TabsContent>

      <TabsContent value="standings">
        <StandingsContent standings={scores.team_sports.standings} />
      </TabsContent>
    </Tabs>
  );
}

// --- Sport chip descriptor (unified across team sports + F1) ---

interface SportChip {
  key: string;
  label: string;
  count: number;
}

function getRecapChips(scores: ScoresSection): SportChip[] {
  const chips: SportChip[] = [];

  for (const recap of scores.team_sports.recaps) {
    if (recap.games.length > 0) {
      chips.push({ key: recap.sport, label: recap.sport, count: recap.games.length });
    }
  }

  if (scores.f1.recaps.weekends.length > 0) {
    chips.push({ key: 'F1', label: 'F1', count: scores.f1.recaps.weekends.length });
  }

  return chips;
}

function getScheduleChips(scores: ScoresSection): SportChip[] {
  const chips: SportChip[] = [];

  for (const sched of scores.team_sports.schedule) {
    if (sched.games.length > 0) {
      chips.push({ key: sched.sport, label: sched.sport, count: sched.games.length });
    }
  }

  if (scores.f1.schedule.weekends.length > 0) {
    chips.push({ key: 'F1', label: 'F1', count: scores.f1.schedule.weekends.length });
  }

  return chips;
}

// --- Recaps ---

function RecapsContent({ scores, date }: { scores: ScoresSection; date?: string }) {
  const chips = getRecapChips(scores);
  const [activeSport, setActiveSport] = useState<string | null>(null);

  if (chips.length === 0) {
    return (
      <EmptyState
        icon={<Trophy />}
        heading="No recaps available"
        description="No games were played."
      />
    );
  }

  const recapDate = scores.team_sports.recaps.find(r => r.games.length > 0)?.date;
  const showF1 = !activeSport || activeSport === 'F1';
  const showTeamSport = (sport: string) => !activeSport || activeSport === sport;

  return (
    <div className="flex flex-col gap-section">
      {/* Header group: date context + chips */}
      <div className="flex flex-col gap-component">
        {recapDate && (
          <div className="flex items-center gap-component text-body-sm text-on-surface-variant">
            <CalendarDays className="size-icon-1 shrink-0" />
            Games from {formatRecapDate(recapDate)}
          </div>
        )}
        <div className="flex flex-wrap gap-component">
          <Chip
            variant={!activeSport ? 'selected' : 'unselected'}
            size="sm"
            onClick={() => setActiveSport(null)}
          >
            All
          </Chip>
          {chips.map((chip) => (
            <Chip
              key={chip.key}
              variant={activeSport === chip.key ? 'selected' : 'unselected'}
              size="sm"
              onClick={() => setActiveSport(activeSport === chip.key ? null : chip.key)}
            >
              {chip.label} ({chip.count})
            </Chip>
          ))}
        </div>
      </div>

      {/* Per-sport sections */}
      <div className="flex flex-col gap-section">
        {/* Team sports */}
        {scores.team_sports.recaps
          .filter((r) => r.games.length > 0 && showTeamSport(r.sport))
          .map((recap) => (
            <div key={recap.sport} className="flex flex-col gap-group">
              {(() => {
                const heading = sportHeading(recap.sport, recap.status, recap.seasonType);
                return (
                  <h3 className="text-title-md text-on-surface">
                    {heading.name}
                    {heading.modifier && (
                      <span className="text-primary"> {heading.modifier}</span>
                    )}
                  </h3>
                );
              })()}
              <div className="flex flex-col gap-component">
                {recap.games.map((game) => (
                  <GameCard key={game.id} game={game} sport={recap.sport} date={date} />
                ))}
              </div>
            </div>
          ))}

        {/* F1 */}
        {showF1 && scores.f1.recaps.weekends.map((weekend) => {
          const days = splitF1ByDay(weekend);
          return days.map((day) => (
            <div key={`${weekend.id}-${day.modifier}`} className="flex flex-col gap-group">
              <h3 className="text-title-md text-on-surface">
                Formula 1<span className="text-primary"> {day.modifier}</span>
              </h3>
              <F1RecapCard
                weekend={{ ...weekend, sessions: day.sessions }}
                date={date}
              />
            </div>
          ));
        })}
      </div>
    </div>
  );
}

// --- Schedule ---

function ScheduleContent({ scores, date }: { scores: ScoresSection; date?: string }) {
  const chips = getScheduleChips(scores);
  const [activeSport, setActiveSport] = useState<string | null>(null);

  if (chips.length === 0) {
    return (
      <EmptyState
        icon={<Clock />}
        heading="No upcoming games"
        description="Scheduled games will appear here."
      />
    );
  }

  const scheduleDate = scores.team_sports.schedule.find(s => s.games.length > 0)?.date;
  const showF1 = !activeSport || activeSport === 'F1';
  const showTeamSport = (sport: string) => !activeSport || activeSport === sport;

  return (
    <div className="flex flex-col gap-section">
      {/* Header group: date context + chips */}
      <div className="flex flex-col gap-component">
        {scheduleDate && (
          <div className="flex items-center gap-component text-body-sm text-on-surface-variant">
            <CalendarDays className="size-icon-1 shrink-0" />
            Upcoming — {formatRecapDate(scheduleDate)}
          </div>
        )}
        <div className="flex flex-wrap gap-component">
          <Chip
            variant={!activeSport ? 'selected' : 'unselected'}
            size="sm"
            onClick={() => setActiveSport(null)}
          >
            All
          </Chip>
          {chips.map((chip) => (
            <Chip
              key={chip.key}
              variant={activeSport === chip.key ? 'selected' : 'unselected'}
              size="sm"
              onClick={() => setActiveSport(activeSport === chip.key ? null : chip.key)}
            >
              {chip.label} ({chip.count})
            </Chip>
          ))}
        </div>
      </div>

      {/* Per-sport sections */}
      <div className="flex flex-col gap-section">
        {/* Team sports */}
        {scores.team_sports.schedule
          .filter((s) => s.games.length > 0 && showTeamSport(s.sport))
          .map((sport) => (
            <div key={sport.sport} className="flex flex-col gap-group">
              <h3 className="text-title-md text-on-surface">{sport.sport}</h3>
              <div className="flex flex-col gap-component">
                {sport.games.map((game) => (
                  <ScheduledGameCard key={game.id} game={game} sport={sport.sport} date={date} />
                ))}
              </div>
            </div>
          ))}

        {/* F1 */}
        {showF1 && scores.f1.schedule.weekends.length > 0 && (
          <div className="flex flex-col gap-group">
            <h3 className="text-title-md text-on-surface">Formula 1</h3>
            <div className="flex flex-col gap-component">
              {scores.f1.schedule.weekends.map((weekend) => (
                <F1ScheduleCard key={weekend.id} weekend={weekend} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
