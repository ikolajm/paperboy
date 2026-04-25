'use client';

import type { Game, ScheduledGame } from '@/types';
import { isCompletedGame } from '../shared/utils';
import { LinescoreTable } from '../shared/LinescoreTable';
import { LeaderComparison } from '../shared/StatLeaders';
import { PitcherMatchup } from '../shared/PitcherSection';
import { InjuryReport } from '../shared/InjuryReport';
import { VenueBroadcast } from '../shared/VenueBroadcast';
import { Blockquote } from '../shared/Blockquote';
import { StatLeaders } from '../shared/StatLeaders';
import { SeriesMatchups } from '../shared/SeriesMatchups';
import { ScoringBreakdown } from './ScoringBreakdown';
import { TeamStatsComparison } from './TeamStatsComparison';


// --- Season leader comparison (scheduled games) ---

function SeasonLeaderSection({ enrichment, awayTeam, homeTeam }: {
  enrichment: NonNullable<Game['enrichment']>;
  awayTeam: { color?: string; alternateColor?: string; logo: string };
  homeTeam: { color?: string; alternateColor?: string; logo: string };
}) {
  const leaders = enrichment.seasonLeaders;
  if (leaders.length < 2) return null;

  const combined = [...leaders[0].leaders, ...leaders[1].leaders];

  return (
    <LeaderComparison
      leaders={combined}
      title="Season Leaders"
      matchKey="category"
      awayColor={awayTeam.color}
      homeColor={homeTeam.color}
      awayAlternateColor={awayTeam.alternateColor}
      homeAlternateColor={homeTeam.alternateColor}
      awayLogo={awayTeam.logo}
      homeLogo={homeTeam.logo}
    />
  );
}

// --- Main overview ---

export function GameOverview({
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
  const enrichment = game.enrichment;

  return (
    <div className="flex flex-col gap-section py-group">
      {/* Article */}
      {enrichment?.article && (
        <Blockquote>
          {enrichment.article.headline}
          {enrichment.article.description && (
            <p className="mt-component-compact not-italic text-on-surface-variant">
              {enrichment.article.description}
            </p>
          )}
        </Blockquote>
      )}

      {/* Linescore (completed games only) */}
      {completed && (
        <LinescoreTable sport={sport} game={game} />
      )}

      {/* Stat leaders (completed) or Season leaders (scheduled) */}
      {completed ? (
        <>
          {/* Visual stat leader matchup cards */}
          <StatLeaders
            playerStats={enrichment?.playerStats}
            gameLeaders={game.leaders}
            sport={sport}
            awayColor={game.away.color}
            homeColor={game.home.color}
            awayAlternateColor={game.away.alternateColor}
            homeAlternateColor={game.home.alternateColor}
            awayLogo={game.away.logo}
            homeLogo={game.home.logo}
          />
          {/* MLB: pitcher matchup cards */}
          {sport === 'MLB' && game.pitchers && game.pitchers.length > 0 && (
            <PitcherMatchup
              pitchers={game.pitchers}
              awayWon={game.awayScore > game.homeScore}
              awayColor={game.away.color}
              homeColor={game.home.color}
              awayAlternateColor={game.away.alternateColor}
              homeAlternateColor={game.home.alternateColor}
              awayLogo={game.away.logo}
              homeLogo={game.home.logo}
            />
          )}
        </>
      ) : enrichment ? (
        <SeasonLeaderSection
          enrichment={enrichment}
          awayTeam={{ color: game.away.color, alternateColor: game.away.alternateColor, logo: game.away.logo }}
          homeTeam={{ color: game.home.color, alternateColor: game.home.alternateColor, logo: game.home.logo }}
        />
      ) : null}

      {/* Charts + team stats comparison (completed games with enrichment) */}
      {completed && enrichment && enrichment.teamStats.length >= 2 && (
        <>
          <ScoringBreakdown
            teamStats={enrichment.teamStats}
            sport={sport}
            awayColor={game.away.color}
            homeColor={game.home.color}
            awayAbbr={game.away.abbreviation}
            homeAbbr={game.home.abbreviation}
          />
          <TeamStatsComparison
            teamStats={enrichment.teamStats}
            awayColor={game.away.color}
            homeColor={game.home.color}
            awayAbbr={game.away.abbreviation}
            homeAbbr={game.home.abbreviation}
            sport={sport}
          />
        </>
      )}

      {/* Series matchups */}
      {enrichment?.seasonSeries && enrichment.seasonSeries.length > 0 && (
        <SeriesMatchups
          seasonSeries={enrichment.seasonSeries}
          awayTeam={{ abbreviation: game.away.abbreviation, logo: game.away.logo }}
          homeTeam={{ abbreviation: game.home.abbreviation, logo: game.home.logo }}
        />
      )}

      {/* Injuries */}
      {enrichment && (
        <InjuryReport
          enrichment={enrichment}
          awayColors={{ color: game.away.color, alternateColor: game.away.alternateColor }}
          homeColors={{ color: game.home.color, alternateColor: game.home.alternateColor }}
        />
      )}

      {/* Venue + broadcast */}
      <VenueBroadcast venue={game.venue} broadcasts={game.broadcasts} />
    </div>
  );
}
