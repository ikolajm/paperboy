'use client';

import type { SeasonSeries } from '@/types';

interface TeamContext {
  abbreviation: string;
  logo: string;
}

function MatchupCard({ game, teams }: {
  game: SeasonSeries['games'][0];
  teams: Record<string, TeamContext>;
}) {
  const awayTeam = teams[game.awayTeam];
  const homeTeam = teams[game.homeTeam];
  const awayWon = game.winner === game.awayTeam;
  const date = new Date(game.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

  return (
    <div className="rounded-card bg-surface-1 px-group py-component flex items-center gap-group min-w-[240px]">
      {/* Teams + scores */}
      <div className="flex flex-col gap-component-compact flex-1">
        {/* Away row */}
        <div className="flex items-center gap-component">
          {awayTeam?.logo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={awayTeam.logo} alt={game.awayTeam} className="size-icon-2 object-contain shrink-0" />
          )}
          <span className={`text-body-sm ${awayWon ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
            {game.awayTeam}
          </span>
          <span className={`text-body-sm tabular-nums ml-auto ${awayWon ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
            {game.awayScore}
            {awayWon && <span className="text-primary ml-0.5">◀</span>}
          </span>
        </div>
        {/* Home row */}
        <div className="flex items-center gap-component">
          {homeTeam?.logo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={homeTeam.logo} alt={game.homeTeam} className="size-icon-2 object-contain shrink-0" />
          )}
          <span className={`text-body-sm ${!awayWon ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
            {game.homeTeam}
          </span>
          <span className={`text-body-sm tabular-nums ml-auto ${!awayWon ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
            {game.homeScore}
            {!awayWon && <span className="text-primary ml-0.5">◀</span>}
          </span>
        </div>
      </div>

      {/* Date */}
      <span className="text-label-sm text-on-surface-variant shrink-0">
        Final {date}
      </span>
    </div>
  );
}

export function SeriesMatchups({
  seasonSeries,
  awayTeam,
  homeTeam,
}: {
  seasonSeries: SeasonSeries[];
  awayTeam: TeamContext;
  homeTeam: TeamContext;
}) {
  if (seasonSeries.length === 0) return null;

  // Build team lookup from abbreviations
  const teams: Record<string, TeamContext> = {
    [awayTeam.abbreviation]: awayTeam,
    [homeTeam.abbreviation]: homeTeam,
  };

  return (
    <div className="flex flex-col gap-group">
      {seasonSeries.map((series) => (
        <div key={series.title} className="flex flex-col gap-component">
          {/* Header */}
          <div className="flex items-center gap-component">
            <span className="text-body-sm text-on-surface font-medium">{series.title}</span>
            {series.summary && (
              <span className="text-body-sm text-primary font-medium">{series.summary}</span>
            )}
          </div>

          {/* Game cards grid */}
          {series.games.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-component">
              {series.games.map((game, i) => (
                <MatchupCard key={i} game={game} teams={teams} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
