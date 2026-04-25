'use client';

import { useState } from 'react';
import type { ScheduledGame } from '@/types';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { TeamHalf } from '../shared/TeamHalf';
import { LeaderComparison } from '../shared/LeaderComparison';
import { InjuryReport } from '../shared/InjuryReport';
import { VenueBroadcast } from '../shared/VenueBroadcast';
import { Provenance } from '../shared/Provenance';
import { Blockquote } from '../shared/Blockquote';
import { GameDetailLink } from '../shared/GameDetailLink';
import { getSeriesSummary } from '../shared/utils';

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

// --- Season leader adapter ---

function SeasonLeaderSection({ enrichment }: { enrichment: NonNullable<ScheduledGame['enrichment']> }) {
  const leaders = enrichment.seasonLeaders;
  if (leaders.length < 2) return null;

  const combined = [...leaders[0].leaders, ...leaders[1].leaders];
  return <LeaderComparison leaders={combined} title="Season Leaders" matchKey="category" />;
}

// --- Main component ---

export function ScheduledGameCard({ game, sport, date }: { game: ScheduledGame; sport: string; date?: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasExpandable = !!game.enrichment;

  return (
    <Card variant="outline" size="sm" className="!p-0 gap-0 overflow-hidden">
      {/* === Collapsed === */}

      {/* Team halves with time in center */}
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

      {/* Footer: notes + series + broadcast + expand */}
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
        <div className="flex flex-col gap-section-compact px-content py-group border-t border-outline-subtle">
          {/* Preview article */}
          {game.enrichment.article && (
            <Blockquote>{game.enrichment.article.headline}</Blockquote>
          )}

          {/* Season leaders comparison */}
          <SeasonLeaderSection enrichment={game.enrichment} />

          {/* Injury report */}
          <InjuryReport
            enrichment={game.enrichment}
            awayColors={{ color: game.away.color, alternateColor: game.away.alternateColor }}
            homeColors={{ color: game.home.color, alternateColor: game.home.alternateColor }}
          />

          {/* Venue + broadcast */}
          <VenueBroadcast venue={game.venue} broadcasts={game.broadcasts} />

          {/* Full pre-game view + provenance */}
          <div className="flex flex-col gap-component-compact">
            {date && (
              <GameDetailLink date={date} gameId={game.id} label="View full pre-game details" />
            )}
            <Provenance enrichment={game.enrichment} />
          </div>
        </div>
      )}
    </Card>
  );
}
