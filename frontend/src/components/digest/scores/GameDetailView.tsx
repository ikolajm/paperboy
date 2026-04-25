'use client';

import type { Game, ScheduledGame } from '@/types';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/atoms/Tabs';
import { ensureContrast } from '../shared/color';
import { isCompletedGame, getSeriesSummary } from '../shared/utils';
import { Provenance } from '../shared/Provenance';
import { ChevronLeft, ChevronRight, Minus, Clock } from 'lucide-react';
import { GameOverview } from './GameOverview';
import { BoxScoreTable } from './BoxScoreTable';

// --- Hero section ---

function GameHero({
  game,
  sport,
  type,
}: {
  game: Game | ScheduledGame;
  sport: string;
  type: 'recap' | 'schedule';
}) {
  const venueImage = game.enrichment?.venueImage;
  const completed = isCompletedGame(game);

  const awayColor = ensureContrast(game.away.color, game.away.alternateColor);
  const homeColor = ensureContrast(game.home.color, game.home.alternateColor);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundImage: venueImage ? `url(${venueImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-group py-section px-content">
        {/* Teams + Score */}
        <div className="flex items-center gap-section w-full max-w-2xl">
          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-component">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={game.away.logo} alt={game.away.abbreviation} className="size-[72px] md:size-[96px] object-contain" />
            <div className="flex flex-col items-center">
              <span className="text-title-md text-white font-medium">
                {game.away.displayName}
              </span>
              <span className="text-label-sm text-white/60">
                {game.away.seed ? `#${game.away.seed} · ` : ''}{game.away.records.total ?? ''}
              </span>
            </div>
          </div>

          {/* Center: score or time */}
          <div className="flex flex-col items-center gap-component-compact shrink-0">
            {completed ? (
              <>
                <div className="flex items-center gap-group">
                  <span
                    className="text-display-lg tabular-nums font-medium"
                    style={{ color: game.awayScore > game.homeScore && awayColor ? `#${awayColor}` : 'rgba(255,255,255,0.5)' }}
                  >
                    {game.awayScore}
                  </span>
                  <div className="text-white/30">
                    {game.awayScore === game.homeScore ? (
                      <Minus className="size-icon-2" />
                    ) : game.awayScore > game.homeScore ? (
                      <ChevronLeft className="size-icon-2" />
                    ) : (
                      <ChevronRight className="size-icon-2" />
                    )}
                  </div>
                  <span
                    className="text-display-lg tabular-nums font-medium"
                    style={{ color: game.homeScore > game.awayScore && homeColor ? `#${homeColor}` : 'rgba(255,255,255,0.5)' }}
                  >
                    {game.homeScore}
                  </span>
                </div>
                <span className="text-label-md text-white/60">{game.status}</span>
              </>
            ) : (
              <>
                <Clock className="size-icon-2 text-white/60" />
                <span className="text-title-md text-white font-medium">
                  {(game as ScheduledGame).startTime}
                </span>
              </>
            )}
          </div>

          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-component">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={game.home.logo} alt={game.home.abbreviation} className="size-[72px] md:size-[96px] object-contain" />
            <div className="flex flex-col items-center">
              <span className="text-title-md text-white font-medium">
                {game.home.displayName}
              </span>
              <span className="text-label-sm text-white/60">
                {game.home.seed ? `#${game.home.seed} · ` : ''}{game.home.records.total ?? ''}
              </span>
            </div>
          </div>
        </div>

        {/* Context: notes + series + venue */}
        <div className="flex items-center gap-component flex-wrap text-label-sm text-white/50">
          {game.notes.length > 0 && <span>{game.notes[0]}</span>}
          {(() => {
            const summary = getSeriesSummary(game.enrichment);
            return summary ? (
              <>
                {game.notes.length > 0 && <span>·</span>}
                <span>{summary}</span>
              </>
            ) : null;
          })()}
          {game.venue && (
            <>
              <span>·</span>
              <span>{game.venue}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main component ---

export function GameDetailView({
  game,
  sport,
  date,
  type,
}: {
  game: Game | ScheduledGame;
  sport: string;
  date: string;
  type: 'recap' | 'schedule';
}) {
  const completed = isCompletedGame(game);
  const hasEnrichment = !!game.enrichment;
  const hasPlayerStats = hasEnrichment && game.enrichment!.playerStats.length > 0;

  return (
    <div className="flex flex-col">
      <GameHero game={game} sport={sport} type={type} />

      <div className="mx-auto w-[100%] max-w-5xl px-content py-section">
        {completed && hasPlayerStats ? (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="boxscore">Box Score</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <GameOverview game={game} sport={sport} date={date} type={type} />
            </TabsContent>

            <TabsContent value="boxscore">
              <div className="py-group">
                <BoxScoreTable playerStats={game.enrichment!.playerStats} sport={sport} />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* Scheduled game or no enrichment — overview only */
          <GameOverview game={game} sport={sport} date={date} type={type} />
        )}

        {/* Provenance */}
        {hasEnrichment && (
          <div className="pt-section border-t border-outline-subtle mt-section">
            <Provenance enrichment={game.enrichment!} />
          </div>
        )}
      </div>
    </div>
  );
}
