'use client';

import { useState } from 'react';
import type { Game, GameLeader } from '@/types';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ExternalLink, Minus, MapPin, Tv } from 'lucide-react';
import { teamColor } from '../shared/color';
import { TeamHalf } from '../shared/TeamHalf';

function linescoreHeaders(sport: string, home: number[], away: number[]): string[] {
  const len = Math.max(home.length, away.length);
  if (len <= 0) return [];

  switch (sport) {
    case 'NHL': {
      const headers = ['P1', 'P2', 'P3'];
      for (let i = 3; i < len; i++) headers.push(i === 3 ? 'OT' : 'SO');
      headers.push('T');
      return headers;
    }
    case 'NBA': {
      const headers = ['Q1', 'Q2', 'Q3', 'Q4'];
      for (let i = 4; i < len; i++) headers.push(i === 4 ? 'OT' : `OT${i - 3}`);
      headers.push('T');
      return headers;
    }
    case 'MLB': {
      const headers = Array.from({ length: len }, (_, i) => `${i + 1}`);
      headers.push('R');
      return headers;
    }
    case 'NFL': {
      const headers = ['Q1', 'Q2', 'Q3', 'Q4'];
      for (let i = 4; i < len; i++) headers.push('OT');
      headers.push('T');
      return headers;
    }
    default: {
      const headers = Array.from({ length: len }, (_, i) => `${i + 1}`);
      headers.push('T');
      return headers;
    }
  }
}

// --- Collapsed: Team half ---

// --- Collapsed: Winner indicator ---

function WinnerIndicator({ awayWon, tied }: { awayWon: boolean; tied: boolean }) {
  return (
    <div className="flex items-center justify-center shrink-0 text-on-surface-variant">
      {tied ? (
        <Minus className="size-icon-1" />
      ) : awayWon ? (
        <ChevronLeft className="size-icon-2" />
      ) : (
        <ChevronRight className="size-icon-2" />
      )}
    </div>
  );
}

// --- Expanded: Linescore table ---

function LinescoreTable({
  sport,
  game,
  awayWon,
}: {
  sport: string;
  game: Game;
  awayWon: boolean;
}) {
  const headers = linescoreHeaders(sport, game.linescores.home, game.linescores.away);
  if (headers.length === 0) return null;

  const periodHeaders = headers.slice(0, -1);
  const totalHeader = headers[headers.length - 1];
  const showHE = sport === 'MLB' && !!game.hitsErrors;

  function ScoreRow({ side, abbreviation, linescores, total, isWinner }: {
    side: 'home' | 'away';
    abbreviation: string;
    linescores: number[];
    total: number;
    isWinner: boolean;
  }) {
    const he = game.hitsErrors?.[side];
    return (
      <tr>
        <td className={`text-body-sm tabular-nums pr-group py-component-compact ${isWinner ? 'font-medium text-on-surface' : 'text-on-surface'}`}>
          {abbreviation}
        </td>
        {linescores.map((val, i) => (
          <td key={i} className="text-body-sm tabular-nums text-on-surface text-center px-component-compact py-component-compact">
            {val}
          </td>
        ))}
        <td className={`text-body-sm tabular-nums text-center pl-group py-component-compact ${isWinner ? 'font-medium text-primary' : 'text-on-surface'}`}>
          {total}
        </td>
        {showHE && he && (
          <>
            <td className="text-body-sm tabular-nums text-on-surface text-center px-component-compact py-component-compact">{he.hits}</td>
            <td className="text-body-sm tabular-nums text-on-surface text-center px-component-compact py-component-compact">{he.errors}</td>
          </>
        )}
      </tr>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-none rounded-component bg-surface-1 px-group py-component">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-body-sm text-on-surface-variant text-left pr-group py-component-compact font-normal" />
            {periodHeaders.map((h) => (
              <th key={h} className="text-body-sm tabular-nums text-on-surface-variant text-center px-component-compact py-component-compact font-normal">
                {h}
              </th>
            ))}
            <th className="text-body-sm tabular-nums text-on-surface-variant text-center pl-group py-component-compact font-normal">
              {totalHeader}
            </th>
            {showHE && (
              <>
                <th className="text-body-sm tabular-nums text-on-surface-variant text-center px-component-compact py-component-compact font-normal">H</th>
                <th className="text-body-sm tabular-nums text-on-surface-variant text-center px-component-compact py-component-compact font-normal">E</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          <ScoreRow
            side="away"
            abbreviation={game.away.abbreviation}
            linescores={game.linescores.away}
            total={game.awayScore}
            isWinner={awayWon}
          />
          <ScoreRow
            side="home"
            abbreviation={game.home.abbreviation}
            linescores={game.linescores.home}
            total={game.homeScore}
            isWinner={!awayWon}
          />
        </tbody>
      </table>
    </div>
  );
}

// --- Expanded: Leader comparison ---

function LeaderComparison({ leaders, sport, game }: { leaders: GameLeader[]; sport: string; game: Game }) {
  // MLB: show pitchers
  if (sport === 'MLB' && game.pitchers && game.pitchers.length > 0) {
    return (
      <div className="flex flex-col gap-component">
        <span className="text-body-sm text-on-surface font-medium">Pitching</span>
        <div className="flex flex-col gap-component-compact">
          {game.pitchers.map((p) => (
            <div key={p.role} className="flex items-center gap-component rounded-component bg-surface-1 px-group py-component">
              <span className={`text-body-sm w-8 shrink-0 uppercase font-medium ${p.role === 'win' ? 'text-success' : p.role === 'loss' ? 'text-error' : 'text-info'}`}>
                {p.role === 'win' ? 'W' : p.role === 'loss' ? 'L' : 'SV'}
              </span>
              <span className="text-body-sm text-on-surface font-medium">
                {p.name}
              </span>
              {p.record && (
                <span className="text-body-sm text-on-surface ml-auto">
                  {p.record}{p.era ? ` · ${p.era} ERA` : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leaders.length === 0) return null;

  // Group leaders by category — first half is away, second half is home
  const halfLen = Math.floor(leaders.length / 2);
  const awayLeaders = leaders.slice(0, halfLen);
  const homeLeaders = leaders.slice(halfLen);

  const categories = awayLeaders.map((al) => {
    const hl = homeLeaders.find((h) => h.shortName === al.shortName);
    return { category: al.shortName, away: al, home: hl };
  });

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-col gap-component">
      <span className="text-body-sm text-on-surface font-medium">Game Leaders</span>
      <div className="flex flex-col gap-component-compact">
        {categories.map(({ category, away, home }) => {
          const awayVal = parseFloat(away.displayValue) || 0;
          const homeVal = parseFloat(home?.displayValue ?? '0') || 0;
          const awayWins = awayVal > homeVal;
          const homeWins = homeVal > awayVal;

          return (
            <div key={category} className="rounded-component bg-surface-1 px-group py-component">
              {/* Category header */}
              <div className="text-body-sm text-on-surface-variant text-center mb-component-compact font-medium">
                {category}
              </div>
              {/* Comparison row */}
              <div className="flex items-center">
                {/* Away */}
                <div className="flex-1 flex items-center gap-component">
                  <span className={`text-body-sm text-on-surface ${awayWins ? 'font-medium' : ''}`}>
                    {away.athlete}
                  </span>
                </div>
                {/* Values */}
                <div className="flex items-center gap-group shrink-0">
                  <span className={`text-body-sm tabular-nums min-w-6 text-right font-medium ${awayWins ? 'text-primary' : 'text-on-surface'}`}>
                    {away.displayValue}
                  </span>
                  <span className="text-on-surface-variant text-body-sm">-</span>
                  <span className={`text-body-sm tabular-nums min-w-6 text-left font-medium ${homeWins ? 'text-primary' : 'text-on-surface'}`}>
                    {home?.displayValue ?? '—'}
                  </span>
                </div>
                {/* Home */}
                <div className="flex-1 flex items-center gap-component justify-end">
                  <span className={`text-body-sm text-on-surface ${homeWins ? 'font-medium' : ''}`}>
                    {home?.athlete ?? '—'}
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

// --- Main component ---

export function GameCard({ game, sport, date }: { game: Game; sport: string; date?: string }) {
  const [expanded, setExpanded] = useState(false);
  const awayWon = game.awayScore > game.homeScore;

  return (
    <Card variant="outline" size="sm" className="!p-0 gap-0 overflow-hidden">
      {/* === Collapsed: always visible === */}

      {/* Team halves with gradient backgrounds */}
      <div className="flex items-stretch">
        <TeamHalf
          side="away"
          logo={game.away.logo}
          abbreviation={game.away.abbreviation}
          record={game.away.records.total ?? ''}
          seed={game.away.seed}
          color={game.away.color}
          alternateColor={game.away.alternateColor}
          score={game.awayScore}
          isWinner={awayWon}
        />
        <WinnerIndicator awayWon={awayWon} tied={game.awayScore === game.homeScore} />
        <TeamHalf
          side="home"
          logo={game.home.logo}
          abbreviation={game.home.abbreviation}
          record={game.home.records.total ?? ''}
          seed={game.home.seed}
          color={game.home.color}
          alternateColor={game.home.alternateColor}
          score={game.homeScore}
          isWinner={!awayWon}
        />
      </div>

      {/* Footer: notes + status + expand toggle */}
      <div className="flex items-center justify-between px-content py-component border-t border-outline-subtle">
        <div className="flex items-center gap-component flex-wrap text-label-sm text-on-surface-variant">
          <span>{game.status}</span>
          {game.notes.length > 0 && (
            <>
              <span className="text-outline-subtle">·</span>
              <span>{game.notes[0]}</span>
            </>
          )}
          {/* Series record from enrichment */}
          {game.enrichment?.seasonSeries && game.enrichment.seasonSeries.length > 0 && (() => {
            // Prefer playoff series, fall back to regular season
            const playoff = game.enrichment!.seasonSeries.find(s => s.title.toLowerCase().includes('playoff'));
            const series = playoff ?? game.enrichment!.seasonSeries[0];
            return series.summary ? (
              <>
                <span className="text-outline-subtle">·</span>
                <span>{series.summary}</span>
              </>
            ) : null;
          })()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>

      {/* === Expanded: toggled === */}
      {expanded && (
        <div className="flex flex-col gap-section-compact px-content py-group border-t border-outline-subtle">
          <div className="flex flex-col gap-section">
            {/* Headline as blockquote */}
            {game.headline && (
              <blockquote className="border-l-2 border-primary pl-3 py-2 text-body-sm text-on-surface italic">
                {game.headline}
              </blockquote>
            )}
            
            {/* --- Linescore table --- */}
            <LinescoreTable sport={sport} game={game} awayWon={awayWon} />

            {/* --- Leader comparison --- */}
            <LeaderComparison leaders={game.leaders} sport={sport} game={game} />
          </div>

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

          {/* --- Footer: full detail + provenance --- */}
          <div className="flex flex-col gap-component-compact">
            {game.enrichment && date && (
              <a
                href={`/scores/${date}/${game.id}`}
                className="inline-flex items-center gap-component-compact text-label-sm text-primary hover:text-on-surface transition-colors self-start"
              >
                <ExternalLink className="size-icon-0" />
                View full game details
              </a>
            )}

            {game.enrichment && (
              <span className="text-label-sm text-outline-subtle">
                Data from {game.enrichment.source} · Collected {new Date(game.enrichment.enriched_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
