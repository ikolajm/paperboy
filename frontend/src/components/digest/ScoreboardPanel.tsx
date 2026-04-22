'use client';

import type { ScoresSection } from '@/types';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/atoms/Tabs';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Trophy, Radio, Clock } from 'lucide-react';

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
      return 'neutral' as const;
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
          <span className="flex items-center gap-1.5">
            <Radio className="size-3.5" />
            Live
          </span>
        </TabsTrigger>
        <TabsTrigger value="recaps">Recaps</TabsTrigger>
        <TabsTrigger value="schedule">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
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
        <div className="flex flex-col gap-4">
          {scores.team_sports.recaps.map((recap) => (
            <Card key={recap.sport} variant="outline" size="sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{recap.sport}</CardTitle>
                  <Badge variant={statusVariant(recap.status)} size="sm">
                    {statusLabel(recap.status)}
                  </Badge>
                </div>
                <CardDescription>
                  {recap.games.length > 0
                    ? `${recap.games.length} games`
                    : 'No games'}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}

          <Card variant="outline" size="sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>UFC</CardTitle>
                <Badge
                  variant={statusVariant(scores.ufc.recaps.status)}
                  size="sm"
                >
                  {statusLabel(scores.ufc.recaps.status)}
                </Badge>
              </div>
              <CardDescription>
                {scores.ufc.recaps.cards.length > 0
                  ? `${scores.ufc.recaps.cards.length} events`
                  : 'No events'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="outline" size="sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>F1</CardTitle>
                <Badge
                  variant={statusVariant(scores.f1.recaps.status)}
                  size="sm"
                >
                  {statusLabel(scores.f1.recaps.status)}
                </Badge>
              </div>
              <CardDescription>
                {scores.f1.recaps.weekends.length > 0
                  ? `${scores.f1.recaps.weekends.length} race weekends`
                  : 'No races'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="schedule">
        <ScheduleContent scores={scores} />
      </TabsContent>
    </Tabs>
  );
}

function ScheduleContent({ scores }: { scores: ScoresSection }) {
  const teamScheduleCount = scores.team_sports.schedule.length;
  const ufcScheduleCount = scores.ufc.schedule.cards.length;
  const f1ScheduleCount = scores.f1.schedule.weekends.length;
  const total = teamScheduleCount + ufcScheduleCount + f1ScheduleCount;

  if (total === 0) {
    return (
      <EmptyState
        icon={<Clock />}
        heading="No upcoming games"
        description="Scheduled games and events will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {ufcScheduleCount > 0 && (
        <Card variant="outline" size="sm">
          <CardHeader>
            <CardTitle>UFC</CardTitle>
            <CardDescription>
              {ufcScheduleCount} upcoming events
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      {f1ScheduleCount > 0 && (
        <Card variant="outline" size="sm">
          <CardHeader>
            <CardTitle>F1</CardTitle>
            <CardDescription>
              {f1ScheduleCount} upcoming race weekends
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
