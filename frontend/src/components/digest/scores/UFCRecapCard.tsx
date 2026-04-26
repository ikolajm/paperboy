'use client';

import { useState } from 'react';
import type { UFCCard, Fight } from '@/types';
import { Card, CardContent } from '@/components/atoms/Card';
import { MapPin, Tv } from 'lucide-react';
import { ExpandToggle } from '../shared/ExpandToggle';
import { getVenueFlagUrl } from './ufc-flags';
import { FightDetailSheet } from './FightDetailSheet';

// --- Method display ---

function formatMethod(fight: Fight): string {
  if (!fight.method || fight.method === 'Final') {
    if (fight.endRound && fight.endTime) {
      return `R${fight.endRound} ${fight.endTime}`;
    }
    return '';
  }

  const parts = [fight.method];
  if (fight.methodDetail) parts.push(`(${fight.methodDetail})`);
  if (fight.endRound) {
    const timeStr = fight.endTime && fight.endTime !== '5:00' ? ` ${fight.endTime}` : '';
    parts.push(`R${fight.endRound}${timeStr}`);
  }
  return parts.join(' ');
}

// --- Fight row ---

function FightRowContent({ fight, isLast = false }: { fight: Fight; isLast?: boolean }) {
  const winner = fight.fighter1.winner ? fight.fighter1 : fight.fighter2.winner ? fight.fighter2 : null;
  const loser = fight.fighter1.winner ? fight.fighter2 : fight.fighter2.winner ? fight.fighter1 : null;
  const method = formatMethod(fight);

  return (
    <div className={`flex flex-col gap-component-compact py-component ${isLast ? '' : 'border-b border-outline-subtle'}`}>
      {/* Fighters */}
      <div className="flex items-center gap-component">
        <div className="flex-1 min-w-0">
          {winner && loser ? (
            <span className="text-body-sm flex items-center gap-component-compact flex-wrap">
              {winner.flagUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={winner.flagUrl} alt="" loading="lazy" className="size-icon-1 object-contain shrink-0 inline" />
              )}
              <span className="font-medium text-on-surface">{winner.name}</span>
              <span className="text-on-surface-variant">def.</span>
              {loser.flagUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={loser.flagUrl} alt="" loading="lazy" className="size-icon-1 object-contain shrink-0 inline" />
              )}
              <span className="text-on-surface-variant">{loser.name}</span>
            </span>
          ) : (
            <span className="text-body-sm flex items-center gap-component-compact">
              {fight.fighter1.flagUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={fight.fighter1.flagUrl} alt="" loading="lazy" className="size-icon-1 object-contain shrink-0" />
              )}
              <span className="text-on-surface">{fight.fighter1.name}</span>
              <span className="text-on-surface-variant">vs.</span>
              {fight.fighter2.flagUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={fight.fighter2.flagUrl} alt="" loading="lazy" className="size-icon-1 object-contain shrink-0" />
              )}
              <span className="text-on-surface">{fight.fighter2.name}</span>
            </span>
          )}
        </div>
      </div>

      {/* Meta: weight class + method */}
      <div className="flex items-center gap-component text-label-md text-on-surface-variant">
        <span>{fight.weightClass}</span>
        {method && (
          <>
            <span className="text-outline-subtle">·</span>
            <span>{method}</span>
          </>
        )}
      </div>
    </div>
  );
}

function FightRow({ fight, isLast = false }: { fight: Fight; isLast?: boolean }) {
  const hasDetail = !!(fight.fighter1Stats && fight.fighter2Stats);

  if (hasDetail) {
    return (
      <FightDetailSheet fight={fight}>
        <button type="button" className="text-left w-full cursor-pointer hover:bg-surface-2/50 transition-colors rounded-component -mx-1 px-1">
          <FightRowContent fight={fight} isLast={isLast} />
        </button>
      </FightDetailSheet>
    );
  }

  return <FightRowContent fight={fight} isLast={isLast} />;
}

// --- Main component ---

export function UFCRecapCard({ card, date }: { card: UFCCard; date?: string }) {
  const [showPrelims, setShowPrelims] = useState(false);
  const flagUrl = getVenueFlagUrl(card.venue);

  // Reverse fights so main event is first
  const allFights = [...card.fights].reverse();

  // Split into main card / prelims based on cardSegment or position
  const mainCard = allFights.filter(f => f.cardSegment === 'Main Card');
  const prelims = allFights.filter(f => f.cardSegment !== 'Main Card');

  // If no cardSegment data, show top 5 as main, rest as prelims
  const hasSegments = mainCard.length > 0;
  const displayMain = hasSegments ? mainCard : allFights.slice(0, 5);
  const displayPrelims = hasSegments ? prelims : allFights.slice(5);

  return (
    <Card variant="outline" size="sm" className="!p-0 gap-0 overflow-hidden">
      <CardContent className="flex flex-col gap-0">
        {/* Header: event name + venue with country flag backdrop */}
        <div
          className="relative flex flex-col gap-component-compact px-content py-component overflow-hidden"
          style={flagUrl ? { backgroundImage: `url(${flagUrl})`, backgroundSize: '115%', backgroundPosition: 'center' } : undefined}
        >
          {flagUrl && <div className="absolute inset-0 bg-surface-1/90 pointer-events-none" />}
          <h4 className="relative text-body-md font-medium text-on-surface">
            {card.eventName}
          </h4>
          <div className="relative flex items-center gap-component text-label-sm text-on-surface-variant">
            <div className="flex items-center gap-component-compact">
              <MapPin className="size-icon-0 shrink-0" />
              <span>{card.venue}</span>
            </div>
          </div>
        </div>

        {/* Main card fights */}
        <div className="flex flex-col border-t border-outline-subtle px-content py-component">
          {displayMain.map((fight, i) => (
            <FightRow key={fight.id} fight={fight} isLast={i === displayMain.length - 1} />
          ))}
        </div>

        {/* Prelims (collapsible) */}
        {displayPrelims.length > 0 && (
          <>
            <ExpandToggle expanded={showPrelims} onToggle={() => setShowPrelims(!showPrelims)}>
              <span>Prelims ({displayPrelims.length} fights)</span>
            </ExpandToggle>
            {showPrelims && (
              <div className="flex flex-col px-content py-component border-t border-outline-subtle">
                {displayPrelims.map((fight, i) => (
                  <FightRow key={fight.id} fight={fight} isLast={i === displayPrelims.length - 1} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
