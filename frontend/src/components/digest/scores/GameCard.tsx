'use client';

import { useState } from 'react';
import type { Game } from '@/types';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Minus } from 'lucide-react';
import { TeamHalf } from '../shared/TeamHalf';
import { LinescoreTable } from '../shared/LinescoreTable';
import { LeaderComparison } from '../shared/LeaderComparison';
import { PitcherSection } from '../shared/PitcherSection';
import { Blockquote } from '../shared/Blockquote';
import { VenueBroadcast } from '../shared/VenueBroadcast';
import { Provenance } from '../shared/Provenance';
import { GameDetailLink } from '../shared/GameDetailLink';
import { getSeriesSummary } from '../shared/utils';

// --- Winner indicator (card-specific) ---

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
          {(() => {
            const summary = getSeriesSummary(game.enrichment);
            return summary ? (
              <>
                <span className="text-outline-subtle">·</span>
                <span>{summary}</span>
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
            {game.headline && (
              <Blockquote>{game.headline}</Blockquote>
            )}
            <LinescoreTable sport={sport} game={game} />
            {sport === 'MLB' && game.pitchers && game.pitchers.length > 0 && (
              <PitcherSection
                pitchers={game.pitchers}
                awayWon={awayWon}
                awayColor={game.away.color}
                homeColor={game.home.color}
                awayAlternateColor={game.away.alternateColor}
                homeAlternateColor={game.home.alternateColor}
                awayLogo={game.away.logo}
                homeLogo={game.home.logo}
              />
            )}
            <LeaderComparison
              leaders={game.leaders}
              title={sport === 'MLB' ? 'Batting Leaders' : 'Game Leaders'}
              awayTeam={{ color: game.away.color, alternateColor: game.away.alternateColor, logo: game.away.logo }}
              homeTeam={{ color: game.home.color, alternateColor: game.home.alternateColor, logo: game.home.logo }}
            />
          </div>

          <VenueBroadcast venue={game.venue} broadcasts={game.broadcasts} />

          <div className="flex flex-col gap-component-compact">
            {game.enrichment && date && (
              <GameDetailLink date={date} gameId={game.id} />
            )}
            {game.enrichment && <Provenance enrichment={game.enrichment} />}
          </div>
        </div>
      )}
    </Card>
  );
}
