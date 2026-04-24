'use client';

import type { ScoresSection } from '@/types';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/atoms/Tabs';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Trophy, Radio, Clock } from 'lucide-react';
import { GameCard } from './GameCard';
import { ScheduledGameCard } from './ScheduledGameCard';
import { UFCRecapCard } from './UFCRecapCard';
import { F1RecapCard } from './F1RecapCard';

function statusVariant(status: string) {
  switch (status) {
    case 'games_played':
    case 'events_completed':
    case 'race_completed':
      return 'success' as const;
    case 'playoffs':
      return 'warning' as const;
    case 'no_games':
    case 'no_events':
    case 'no_race':
    case 'out_of_season':
      return 'neutral' as const;
    default:
      return 'info' as const;
  }
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

export function ScoreboardPanel({
  scores,
}: {
  scores: ScoresSection | null;
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
        <TabsTrigger value="live">
          <span className="flex items-center gap-component-compact">
            <Radio className="size-icon-1" />
            Live
          </span>
        </TabsTrigger>
        <TabsTrigger value="recaps">Recaps</TabsTrigger>
        <TabsTrigger value="schedule">
          <span className="flex items-center gap-component-compact">
            <Clock className="size-icon-1" />
            Schedule
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="live">
        <EmptyState
          icon={<Radio />}
          heading="Live scores coming soon"
          description="Real-time game updates will appear here during game time."
        />
      </TabsContent>

      <TabsContent value="recaps">
        <RecapsContent scores={scores} />
      </TabsContent>

      <TabsContent value="schedule">
        <ScheduleContent scores={scores} />
      </TabsContent>
    </Tabs>
  );
}

function RecapsContent({ scores }: { scores: ScoresSection }) {
  return (
    <div className="flex flex-col gap-section">
      {scores.team_sports.recaps.map((recap) => (
        <div key={recap.sport} className="flex flex-col gap-group">
          <div className="flex items-center gap-component">
            <h3 className="text-title-md text-on-surface">
              {recap.sport}
            </h3>
            <Badge variant={statusVariant(recap.status)} size="sm">
              {statusLabel(recap.status)}
            </Badge>
          </div>
          {recap.games.length > 0 ? (
            <div className="flex flex-col gap-component">
              {recap.games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">
              No games played.
            </p>
          )}
        </div>
      ))}

      <div className="flex flex-col gap-component">
        <div className="flex items-center gap-component">
          <h3 className="text-title-md text-on-surface">UFC</h3>
          <Badge
            variant={statusVariant(scores.ufc.recaps.status)}
            size="sm"
          >
            {statusLabel(scores.ufc.recaps.status)}
          </Badge>
        </div>
        {scores.ufc.recaps.cards.length > 0 ? (
          <div className="flex flex-col gap-component">
            {scores.ufc.recaps.cards.map((card) => (
              <UFCRecapCard key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant">No events.</p>
        )}
      </div>

      <div className="flex flex-col gap-component">
        <div className="flex items-center gap-component">
          <h3 className="text-title-md text-on-surface">F1</h3>
          <Badge
            variant={statusVariant(scores.f1.recaps.status)}
            size="sm"
          >
            {statusLabel(scores.f1.recaps.status)}
          </Badge>
        </div>
        {scores.f1.recaps.weekends.length > 0 ? (
          <div className="flex flex-col gap-component">
            {scores.f1.recaps.weekends.map((weekend) => (
              <F1RecapCard key={weekend.id} weekend={weekend} />
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant">No races.</p>
        )}
      </div>
    </div>
  );
}

function ScheduleContent({ scores }: { scores: ScoresSection }) {
  const hasTeamGames = scores.team_sports.schedule.some(
    (s) => s.games.length > 0
  );
  const hasUfc = scores.ufc.schedule.cards.length > 0;
  const hasF1 = scores.f1.schedule.weekends.length > 0;

  if (!hasTeamGames && !hasUfc && !hasF1) {
    return (
      <EmptyState
        icon={<Clock />}
        heading="No upcoming games"
        description="Scheduled games and events will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-section">
      {scores.team_sports.schedule.map((sport) => {
        if (sport.games.length === 0) return null;
        return (
          <div key={sport.sport} className="flex flex-col gap-2">
            <h3 className="text-title-md text-on-surface">
              {sport.sport}
            </h3>
            <div className="flex flex-col gap-component">
              {sport.games.map((game) => (
                <ScheduledGameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        );
      })}

      {hasUfc && (
        <div className="flex flex-col gap-component">
          <h3 className="text-title-md text-on-surface">
            UFC — Upcoming
          </h3>
          {scores.ufc.schedule.cards.map((card) => (
            <UFCRecapCard key={card.id} card={card} />
          ))}
        </div>
      )}

      {hasF1 && (
        <div className="flex flex-col gap-component">
          <h3 className="text-title-md text-on-surface">
            F1 — Upcoming
          </h3>
          {scores.f1.schedule.weekends.map((weekend) => (
            <F1RecapCard key={weekend.id} weekend={weekend} />
          ))}
        </div>
      )}
    </div>
  );
}
