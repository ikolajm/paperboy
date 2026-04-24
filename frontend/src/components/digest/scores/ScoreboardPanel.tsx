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

// --- Helpers ---

function sportHeading(sport: string, status: string, seasonType: number): { name: string; modifier?: string } {
  if (seasonType === 3 || status === 'playoffs') {
    return { name: sport, modifier: 'Playoffs' };
  }
  return { name: sport };
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
      </TabsList>

      <TabsContent value="recaps">
        <RecapsContent scores={scores} date={date} />
      </TabsContent>

      <TabsContent value="schedule">
        <ScheduleContent scores={scores} date={date} />
      </TabsContent>
    </Tabs>
  );
}

// --- Recaps ---

function RecapsContent({ scores, date }: { scores: ScoresSection; date?: string }) {
  // Only team sports with games (skip UFC/F1 for now)
  const activeSports = scores.team_sports.recaps.filter(
    (r) => r.games.length > 0,
  );

  const [activeSport, setActiveSport] = useState<string | null>(null);

  if (activeSports.length === 0) {
    return (
      <EmptyState
        icon={<Trophy />}
        heading="No recaps available"
        description="No games were played."
      />
    );
  }

  // Get the date from the first sport with games
  const recapDate = activeSports[0]?.date;

  const visibleSports = activeSport
    ? activeSports.filter((r) => r.sport === activeSport)
    : activeSports;

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
          {activeSports.map((recap) => (
            <Chip
              key={recap.sport}
              variant={activeSport === recap.sport ? 'selected' : 'unselected'}
              size="sm"
              onClick={() => setActiveSport(activeSport === recap.sport ? null : recap.sport)}
            >
              {recap.sport} ({recap.games.length})
            </Chip>
          ))}
        </div>
      </div>

      {/* Per-sport sections */}
      <div className="flex flex-col gap-section">
        {visibleSports.map((recap) => (
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
      </div>
    </div>
  );
}

// --- Schedule ---

function ScheduleContent({ scores, date }: { scores: ScoresSection; date?: string }) {
  // Only team sports with scheduled games (skip UFC/F1 for now)
  const activeSports = scores.team_sports.schedule.filter(
    (s) => s.games.length > 0,
  );

  const [activeSport, setActiveSport] = useState<string | null>(null);

  if (activeSports.length === 0) {
    return (
      <EmptyState
        icon={<Clock />}
        heading="No upcoming games"
        description="Scheduled games will appear here."
      />
    );
  }

  const scheduleDate = activeSports[0]?.date;

  const visibleSports = activeSport
    ? activeSports.filter((s) => s.sport === activeSport)
    : activeSports;

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
          {activeSports.map((sport) => (
            <Chip
              key={sport.sport}
              variant={activeSport === sport.sport ? 'selected' : 'unselected'}
              size="sm"
              onClick={() => setActiveSport(activeSport === sport.sport ? null : sport.sport)}
            >
              {sport.sport} ({sport.games.length})
            </Chip>
          ))}
        </div>
      </div>

      {/* Per-sport sections */}
      <div className="flex flex-col gap-section">
        {visibleSports.map((sport) => (
          <div key={sport.sport} className="flex flex-col gap-group">
            <h3 className="text-title-md text-on-surface">
              {sport.sport}
            </h3>
            {/* Schedule headers don't have seasonType — notes carry series context */}
            <div className="flex flex-col gap-component">
              {sport.games.map((game) => (
                <ScheduledGameCard key={game.id} game={game} sport={sport.sport} date={date} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
