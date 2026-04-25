'use client';

import { useState } from 'react';
import type { ScheduledGame } from '@/types';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { TeamHalf } from '../shared/TeamHalf';
import { getSeriesSummary } from '../shared/utils';
import { ExpandedCardContent } from './ExpandedCardContent';

// --- Center time display ---

function TimeCenter({ startTime }: { startTime: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 shrink-0 px-group">
      <Clock className="size-icon-1 text-on-surface-variant" />
      <span className="text-body-sm font-medium text-on-surface tabular-nums">
        {startTime}
      </span>
    </div>
  );
}

// --- Main component ---

export function ScheduledGameCard({ game, sport, date }: { game: ScheduledGame; sport: string; date?: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasExpandable = !!game.enrichment;

  return (
    <Card variant="outline" size="sm" className="!p-0 gap-0 overflow-hidden">
      {/* === Collapsed === */}
      <div className="flex items-stretch">
        <TeamHalf
          side="away"
          logo={game.away.logo}
          abbreviation={game.away.abbreviation}
          record={game.away.records.total ?? ''}
          seed={game.away.seed}
          color={game.away.color}
          alternateColor={game.away.alternateColor}
        />
        <TimeCenter startTime={game.startTime} />
        <TeamHalf
          side="home"
          logo={game.home.logo}
          abbreviation={game.home.abbreviation}
          record={game.home.records.total ?? ''}
          seed={game.home.seed}
          color={game.home.color}
          alternateColor={game.home.alternateColor}
        />
      </div>

      {/* Footer: notes + series + expand */}
      <div className="flex items-center justify-between px-content py-component border-t border-outline-subtle">
        <div className="flex items-center gap-component flex-wrap text-label-sm text-on-surface-variant">
          {game.notes.length > 0 && (
            <span>{game.notes[0]}</span>
          )}
          {(() => {
            const summary = getSeriesSummary(game.enrichment);
            return summary ? (
              <>
                {game.notes.length > 0 && <span className="text-outline-subtle">·</span>}
                <span>{summary}</span>
              </>
            ) : null;
          })()}
        </div>
        {hasExpandable && (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        )}
      </div>

      {/* === Expanded === */}
      {expanded && game.enrichment && (
        <ExpandedCardContent game={game} sport={sport} date={date} />
      )}
    </Card>
  );
}
