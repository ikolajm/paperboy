import type { GameEnrichment } from '@/types';
import { ensureContrast } from './color';

interface TeamColors {
  color?: string;
  alternateColor?: string;
}

export function InjuryReport({
  enrichment,
  awayColors,
  homeColors,
  awayAbbr,
  homeAbbr,
}: {
  enrichment: GameEnrichment;
  awayColors?: TeamColors;
  homeColors?: TeamColors;
  awayAbbr?: string;
  homeAbbr?: string;
}) {
  const allTeams = enrichment.injuries;
  // Only render if at least one team has actual injuries
  const hasAnyInjuries = allTeams.some(t => t.injuries.length > 0);
  if (allTeams.length === 0 || !hasAnyInjuries) return null;

  const awayColor = awayColors ? ensureContrast(awayColors.color, awayColors.alternateColor) : undefined;
  const homeColor = homeColors ? ensureContrast(homeColors.color, homeColors.alternateColor) : undefined;

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Injuries</span>
      <div className="flex flex-col gap-component-compact">
        {allTeams.map((t) => {
          // Match color by abbreviation, fall back to away=first, home=second
          const isAway = awayAbbr ? t.abbreviation === awayAbbr : false;
          const isHome = homeAbbr ? t.abbreviation === homeAbbr : false;
          const teamColor = isAway ? awayColor : isHome ? homeColor : (allTeams.indexOf(t) === 0 ? awayColor : homeColor);
          return (
            <div
              key={t.team}
              className="rounded-component px-group py-component text-body-sm"
              style={{
                backgroundColor: teamColor ? `#${teamColor}15` : 'var(--surface-1)',
                borderLeft: teamColor ? `3px solid #${teamColor}` : undefined,
              }}
            >
              <span className="text-on-surface font-medium">{t.abbreviation}: </span>
              {t.injuries.length === 0 ? (
                <span className="text-on-surface-variant">None reported</span>
              ) : (
                <span className="text-on-surface-variant">
                  {t.injuries.map((inj, j) => (
                    <span key={inj.name}>
                      {inj.name} ({inj.status}{inj.injuryType ? ` · ${inj.injuryType}` : ''})
                      {j < t.injuries.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
