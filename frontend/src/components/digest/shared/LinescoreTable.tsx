'use client';

import type { Game } from '@/types';
import { linescoreHeaders } from './linescore';


export function LinescoreTable({
  sport,
  game,
}: {
  sport: string;
  game: Game;
}) {
  const headers = linescoreHeaders(sport, game.linescores.home, game.linescores.away);
  if (headers.length === 0) return null;

  const periodHeaders = headers.slice(0, -1);
  const totalHeader = headers[headers.length - 1];
  const awayWon = game.awayScore > game.homeScore;
  const showHE = sport === 'MLB' && !!game.hitsErrors;

  const rows = [
    { side: 'away' as const, team: game.away, scores: game.linescores.away, total: game.awayScore, won: awayWon },
    { side: 'home' as const, team: game.home, scores: game.linescores.home, total: game.homeScore, won: !awayWon },
  ];

  return (
    <div className="overflow-x-auto scrollbar-none rounded-card bg-surface-1">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-outline-subtle">
            <th className="text-body-sm text-on-surface-variant text-left py-component px-group font-normal min-w-[100px]">Team</th>
            {periodHeaders.map((h) => (
              <th key={h} className="text-body-sm tabular-nums text-on-surface-variant text-center px-component-compact py-component font-normal">{h}</th>
            ))}
            <th className="text-body-sm tabular-nums text-on-surface-variant text-center px-group py-component font-medium border-l border-outline-subtle">{totalHeader}</th>
            {showHE && (
              <>
                <th className="text-body-sm tabular-nums text-on-surface-variant text-center px-component-compact py-component font-normal">H</th>
                <th className="text-body-sm tabular-nums text-on-surface-variant text-center px-component-compact py-component font-normal">E</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ side, team, scores, total, won }) => {
            return (
              <tr key={side} className="border-b border-outline-subtle last:border-b-0">
                {/* Team cell with logo + abbreviation */}
                <td className="py-component px-group">
                  <div className="flex items-center gap-component">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={team.logo} alt={team.abbreviation} loading="lazy" className="size-icon-2 object-contain shrink-0" />
                    <span className={`text-body-sm ${won ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
                      {team.abbreviation}
                    </span>
                  </div>
                </td>
                {/* Period scores — pad with "-" if fewer innings than header count */}
                {periodHeaders.map((_, i) => (
                  <td key={i} className="text-body-sm tabular-nums text-on-surface text-center px-component-compact py-component">
                    {i < scores.length ? scores[i] : '—'}
                  </td>
                ))}
                {/* Total */}
                <td
                  className={`text-body-sm tabular-nums text-center px-group py-component border-l border-outline-subtle ${won ? 'font-medium text-primary' : 'text-on-surface'}`}
                >
                  {total}
                </td>
                {/* H/E for MLB */}
                {showHE && game.hitsErrors && (
                  <>
                    <td className="text-body-sm tabular-nums text-on-surface text-center px-component-compact py-component">{game.hitsErrors[side].hits}</td>
                    <td className="text-body-sm tabular-nums text-on-surface text-center px-component-compact py-component">{game.hitsErrors[side].errors}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
