'use client';

import type { Game, ScheduledGame } from '@/types';
import { LinescoreTable } from '../shared/LinescoreTable';
import { LeaderComparison } from '../shared/StatLeaders';
import { PitcherSection } from '../shared/PitcherSection';
import { InjuryReport } from '../shared/InjuryReport';
import { Blockquote } from '../shared/Blockquote';
import { VenueBroadcast } from '../shared/VenueBroadcast';
import { Provenance } from '../shared/Provenance';
import { GameDetailLink } from '../shared/GameDetailLink';
import { isCompletedGame } from '../shared/utils';

// --- Season leader adapter ---

function SeasonLeaderSection({ enrichment, game }: {
  enrichment: NonNullable<ScheduledGame['enrichment']>;
  game: ScheduledGame;
}) {
  const leaders = enrichment.seasonLeaders;
  if (leaders.length < 2) return null;

  const combined = [...leaders[0].leaders, ...leaders[1].leaders];
  return (
    <LeaderComparison
      leaders={combined}
      title="Season Leaders"
      matchKey="category"
      awayColor={game.away.color}
      homeColor={game.home.color}
      awayAlternateColor={game.away.alternateColor}
      homeAlternateColor={game.home.alternateColor}
      awayLogo={game.away.logo}
      homeLogo={game.home.logo}
    />
  );
}

// --- Main export ---

export function ExpandedCardContent({
  game,
  sport,
  date,
}: {
  game: Game | ScheduledGame;
  sport: string;
  date?: string;
}) {
  const completed = isCompletedGame(game);
  const enrichment = game.enrichment;

  return (
    <div className="flex flex-col px-content border-t border-outline-subtle">
      {/* Article / headline */}
      {completed && game.headline && (
        <div className="py-group">
          <Blockquote>{game.headline}</Blockquote>
        </div>
      )}
      {!completed && enrichment?.article && (
        <div className="py-group">
          <Blockquote>{enrichment.article.headline}</Blockquote>
        </div>
      )}

      {/* Linescore (recaps only) */}
      {completed && (
        <div className="py-group border-t border-outline-subtle">
          <LinescoreTable sport={sport} game={game} />
        </div>
      )}

      {/* Key players: pitchers + leaders (only render section if we have data) */}
      {completed && (game.leaders.length > 0 || (sport === 'MLB' && game.pitchers && game.pitchers.length > 0)) && (
        <div className="flex flex-col gap-section py-group border-t border-outline-subtle">
          {sport === 'MLB' && game.pitchers && game.pitchers.length > 0 && (
            <PitcherSection
              pitchers={game.pitchers}
              awayWon={game.awayScore > game.homeScore}
              awayColor={game.away.color}
              homeColor={game.home.color}
              awayAlternateColor={game.away.alternateColor}
              homeAlternateColor={game.home.alternateColor}
              awayLogo={game.away.logo}
              homeLogo={game.home.logo}
              defaultExpanded={false}
            />
          )}
          {game.leaders.length > 0 && (
            <LeaderComparison
              leaders={game.leaders}
              title={sport === 'MLB' ? 'Batting Leaders' : 'Game Leaders'}
              sport={sport}
              awayColor={game.away.color}
              homeColor={game.home.color}
              awayAlternateColor={game.away.alternateColor}
              homeAlternateColor={game.home.alternateColor}
              awayLogo={game.away.logo}
              homeLogo={game.home.logo}
              defaultExpanded={false}
            />
          )}
        </div>
      )}

      {/* Season leaders (schedule only) */}
      {!completed && enrichment && (
        <div className="py-group border-t border-outline-subtle">
          <SeasonLeaderSection enrichment={enrichment} game={game as ScheduledGame} />
        </div>
      )}

      {/* Injuries (only if any team has actual injuries) */}
      {enrichment && enrichment.injuries.some(t => t.injuries.length > 0) && (
        <div className="py-group border-t border-outline-subtle">
          <InjuryReport
            enrichment={enrichment}
            awayColors={{ color: game.away.color, alternateColor: game.away.alternateColor }}
            homeColors={{ color: game.home.color, alternateColor: game.home.alternateColor }}
            awayAbbr={game.away.abbreviation}
            homeAbbr={game.home.abbreviation}
          />
        </div>
      )}

      {/* Venue + links */}
      <div className="flex flex-col gap-component-compact py-group border-t border-outline-subtle">
        <VenueBroadcast venue={game.venue} broadcasts={game.broadcasts} />
        {enrichment && date && (
          <GameDetailLink
            date={date}
            gameId={game.id}
            label={completed ? undefined : 'View full pre-game details'}
          />
        )}
        {enrichment && <Provenance enrichment={enrichment} />}
      </div>
    </div>
  );
}
