'use client';

import { useState } from 'react';
import type { Game } from '@/types';
import { Card } from '@/components/atoms/Card';
import { Minus } from 'lucide-react';
import { TeamHalf } from '../shared/TeamHalf';
import { ExpandToggle } from '../shared/ExpandToggle';
import { getSeriesSummary } from '../shared/utils';
import { ExpandedCardContent } from './ExpandedCardContent';

// --- Winner indicator ---

function WinnerIndicator({ awayWon, tied }: { awayWon: boolean; tied: boolean }) {
  return (
    <div className="flex items-center justify-center shrink-0 text-on-surface">
      {tied ? (
        <Minus className="size-icon-1 text-on-surface-variant" />
      ) : awayWon ? (
        <span className="text-body-sm">◀</span>
      ) : (
        <span className="text-body-sm">▶</span>
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

      {/* Footer */}
      <ExpandToggle expanded={expanded} onToggle={() => setExpanded(!expanded)}>
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
      </ExpandToggle>

      {/* === Expanded === */}
      {expanded && (
        <ExpandedCardContent game={game} sport={sport} date={date} />
      )}
    </Card>
  );
}
