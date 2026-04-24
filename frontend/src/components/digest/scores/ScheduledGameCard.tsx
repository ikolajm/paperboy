'use client';

import { useState } from 'react';
import type { ScheduledGame } from '@/types';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { ChevronDown, ChevronUp, MapPin, Tv, Clock } from 'lucide-react';
import { TeamHalf } from '../shared/TeamHalf';

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

// --- Expanded: Season leader comparison ---

function SeasonLeaderComparison({ enrichment }: { enrichment: NonNullable<ScheduledGame['enrichment']> }) {
  const leaders = enrichment.seasonLeaders;
  if (leaders.length < 2) return null;

  const away = leaders[0];
  const home = leaders[1];

  // Pair categories
  const categories = away.leaders.map((al) => {
    const hl = home.leaders.find((h) => h.category === al.category);
    return { category: al.category, away: al, home: hl };
  });

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Season Leaders</span>
      <div className="flex flex-col gap-component-compact">
        {categories.map(({ category, away: al, home: hl }) => {
          const awayVal = parseFloat(al.displayValue) || 0;
          const homeVal = parseFloat(hl?.displayValue ?? '0') || 0;
          const awayWins = awayVal > homeVal;
          const homeWins = homeVal > awayVal;

          return (
            <div key={category} className="rounded-component bg-surface-1 px-group py-component">
              <div className="text-body-sm text-on-surface-variant text-center mb-component-compact font-medium">
                {category}
              </div>
              <div className="flex items-center">
                <div className="flex-1 flex items-center gap-component">
                  <span className={`text-body-sm text-on-surface ${awayWins ? 'font-medium' : ''}`}>
                    {al.athlete}
                  </span>
                </div>
                <div className="flex items-center gap-group shrink-0">
                  <span className={`text-body-sm tabular-nums min-w-8 text-right font-medium ${awayWins ? 'text-primary' : 'text-on-surface'}`}>
                    {al.displayValue}
                  </span>
                  <span className="text-on-surface-variant text-body-sm">-</span>
                  <span className={`text-body-sm tabular-nums min-w-8 text-left font-medium ${homeWins ? 'text-primary' : 'text-on-surface'}`}>
                    {hl?.displayValue ?? '—'}
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-component justify-end">
                  <span className={`text-body-sm text-on-surface ${homeWins ? 'font-medium' : ''}`}>
                    {hl?.athlete ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Expanded: Injury report ---

function InjuryReport({ enrichment }: { enrichment: NonNullable<ScheduledGame['enrichment']> }) {
  const allTeams = enrichment.injuries;
  if (allTeams.length === 0) return null;

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Injuries</span>
      <div className="flex flex-col gap-component-compact rounded-component bg-surface-1 px-group py-component">
        {allTeams.map((t) => (
          <div key={t.team} className="text-body-sm">
            <span className="text-on-surface font-medium">{t.abbreviation}: </span>
            {t.injuries.length === 0 ? (
              <span className="text-on-surface-variant text-[12px]">None</span>
            ) : (
              <span className="text-on-surface-variant text-[12px]">
                {t.injuries.map((inj, i) => (
                  <span key={inj.name}>
                    {inj.name} ({inj.status}{inj.injuryType ? ` · ${inj.injuryType}` : ''})
                    {i < t.injuries.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </span>
            )}
          </div>
        ))}
      </div>
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

      {/* Footer: notes + broadcast + expand */}
      <div className="flex items-center justify-between px-content py-component border-t border-outline-subtle">
        <div className="flex items-center gap-component flex-wrap text-label-sm text-on-surface-variant">
          {game.notes.length > 0 && (
            <span>{game.notes[0]}</span>
          )}
          {/* Series record from enrichment */}
          {game.enrichment?.seasonSeries && game.enrichment.seasonSeries.length > 0 && (() => {
            const playoff = game.enrichment!.seasonSeries.find(s => s.title.toLowerCase().includes('playoff'));
            const series = playoff ?? game.enrichment!.seasonSeries[0];
            return series.summary ? (
              <>
                {game.notes.length > 0 && <span className="text-outline-subtle">·</span>}
                <span>{series.summary}</span>
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
            <blockquote className="border-l-2 border-primary pl-3 py-2 text-body-sm text-on-surface italic">
              {game.enrichment.article.headline}
            </blockquote>
          )}

          {/* Season leaders comparison */}
          <SeasonLeaderComparison enrichment={game.enrichment} />

          {/* Injury report */}
          <InjuryReport enrichment={game.enrichment} />

          <div className="flex flex-col gap-component">
            {/* Location */}
            {game.venue && (
              <div className="flex items-center gap-component text-label-sm text-on-surface-variant">
                <MapPin className="size-icon-1 shrink-0" />
                {game.venue}
              </div>
            )}

            {/* Broadcast */}
            {game.broadcasts.length > 0 && (
              <div className="flex items-center gap-component text-label-sm text-on-surface-variant">
                <Tv className="size-icon-1 shrink-0" />
                {game.broadcasts.join(', ')}
              </div>
            )}
          </div>

          {/* Provenance */}
          <span className="text-label-sm text-outline-subtle">
            Data from {game.enrichment.source} · Collected {new Date(game.enrichment.enriched_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
      )}
    </Card>
  );
}
