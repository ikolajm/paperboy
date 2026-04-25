'use client';

import { ensureContrast } from './color';

interface LeaderEntry {
  category: string;
  shortName: string;
  athlete: string;
  displayValue: string;
  jersey?: string;
  position?: string;
}

interface TeamContext {
  color?: string;
  alternateColor?: string;
  logo: string;
}

interface LeaderComparisonProps {
  /** Leaders from both teams — first half away, second half home */
  leaders: LeaderEntry[];
  /** Section title */
  title?: string;
  /** Match key — 'shortName' for game leaders, 'category' for season leaders */
  matchKey?: 'shortName' | 'category';
  /** Optional team context for colored card backgrounds */
  awayTeam?: TeamContext;
  homeTeam?: TeamContext;
}

export function LeaderComparison({
  leaders,
  title = 'Game Leaders',
  matchKey = 'shortName',
  awayTeam,
  homeTeam,
}: LeaderComparisonProps) {
  if (leaders.length === 0) return null;

  const halfLen = Math.floor(leaders.length / 2);
  const awayLeaders = leaders.slice(0, halfLen);
  const homeLeaders = leaders.slice(halfLen);

  const categories = awayLeaders.map((al) => {
    const hl = homeLeaders.find((h) => h[matchKey] === al[matchKey]);
    const label = matchKey === 'category' ? al.category : al.shortName;
    return { category: label, away: al, home: hl };
  });

  if (categories.length === 0) return null;

  const hasTeamContext = !!(awayTeam && homeTeam);
  const awayColor = hasTeamContext ? ensureContrast(awayTeam!.color, awayTeam!.alternateColor) : undefined;
  const homeColor = hasTeamContext ? ensureContrast(homeTeam!.color, homeTeam!.alternateColor) : undefined;

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">{title}</span>
      <div className="flex flex-col gap-component-compact">
        {categories.map(({ category, away, home }) => {
          const awayVal = parseFloat(away.displayValue) || 0;
          const homeVal = parseFloat(home?.displayValue ?? '0') || 0;
          const awayWins = awayVal > homeVal;
          const homeWins = homeVal > awayVal;

          return (
            <div key={category} className="rounded-card overflow-hidden">
              {/* Category label */}
              <div className="text-body-sm text-on-surface-variant text-center py-component-compact bg-surface-1 font-medium">
                {category}
              </div>
              {/* Comparison */}
              <div className="flex">
                {/* Away half */}
                <div
                  className="flex-1 relative overflow-hidden px-group py-component"
                  style={awayColor ? { backgroundColor: `#${awayColor}80` } : { backgroundColor: 'var(--surface-1)' }}
                >
                  {/* Team logo watermark */}
                  {awayTeam && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={awayTeam.logo} alt="" className="absolute opacity-10 size-[48px] left-1 top-1" />
                  )}
                  <div className="relative z-[1] flex items-center gap-component">
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`text-body-sm ${awayWins ? 'font-medium text-white' : 'text-white/70'}`}>
                        {away.athlete}
                      </span>
                      {(away.position || away.jersey) && (
                        <span className="text-label-sm text-white/50">
                          {[away.position, away.jersey ? `#${away.jersey}` : ''].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                    <span className={`text-title-sm tabular-nums ${awayWins ? 'font-medium text-white' : 'text-white/70'}`}>
                      {away.displayValue}
                    </span>
                  </div>
                </div>

                {/* Home half */}
                <div
                  className="flex-1 relative overflow-hidden px-group py-component"
                  style={homeColor ? { backgroundColor: `#${homeColor}80` } : { backgroundColor: 'var(--surface-1)' }}
                >
                  {/* Team logo watermark */}
                  {homeTeam && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={homeTeam.logo} alt="" className="absolute opacity-10 size-[48px] right-1 top-1" />
                  )}
                  <div className="relative z-[1] flex items-center gap-component">
                    <span className={`text-title-sm tabular-nums ${homeWins ? 'font-medium text-white' : 'text-white/70'}`}>
                      {home?.displayValue ?? '—'}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1 items-end">
                      <span className={`text-body-sm ${homeWins ? 'font-medium text-white' : 'text-white/70'}`}>
                        {home?.athlete ?? '—'}
                      </span>
                      {home && (home.position || home.jersey) && (
                        <span className="text-label-sm text-white/50">
                          {[home.position, home.jersey ? `#${home.jersey}` : ''].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
