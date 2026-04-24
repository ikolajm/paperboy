import type { ScheduledGame } from '@/types';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';

export function ScheduledGameCard({ game }: { game: ScheduledGame }) {
  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-component">
        <div className="flex items-center gap-component flex-wrap">
          <Badge variant="info" size="sm">
            {game.startTime}
          </Badge>
          {game.broadcasts.length > 0 && (
            <span className="text-label-sm text-on-surface-variant">
              {game.broadcasts.join(', ')}
            </span>
          )}
          {game.notes.length > 0 && (
            <span className="text-label-sm text-on-surface-variant">
              {game.notes[0]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-group">
          <div className="flex items-center gap-component">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.away.logo}
              alt={game.away.abbreviation}
              className="size-icon-3 object-contain"
            />
            <span className="text-body-md font-medium text-on-surface">
              {game.away.abbreviation}
            </span>
            <span className="text-label-sm text-on-surface-variant">
              {game.away.records.total ?? ''}
            </span>
          </div>
          <span className="text-label-sm text-on-surface-variant">@</span>
          <div className="flex items-center gap-component">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.home.logo}
              alt={game.home.abbreviation}
              className="size-icon-3 object-contain"
            />
            <span className="text-body-md font-medium text-on-surface">
              {game.home.abbreviation}
            </span>
            <span className="text-label-sm text-on-surface-variant">
              {game.home.records.total ?? ''}
            </span>
          </div>
        </div>

        <p className="text-label-sm text-on-surface-variant">{game.venue}</p>
      </CardContent>
    </Card>
  );
}
