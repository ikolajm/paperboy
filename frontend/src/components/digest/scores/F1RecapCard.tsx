'use client';

import { useState } from 'react';
import type { F1Weekend, F1Session } from '@/types';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { MapPin, Trophy } from 'lucide-react';
import { ExpandToggle } from '../shared/ExpandToggle';
import { ensureContrast } from '../shared/color';
import { getCircuitFlagUrl } from './f1-flags';

// --- Session type labels ---

const SESSION_LABELS: Record<string, string> = {
  Race: 'Race',
  Qual: 'Qualifying',
  FP1: 'Free Practice 1',
  FP2: 'Free Practice 2',
  FP3: 'Free Practice 3',
};

// --- Session results table ---

function SessionTable({ session, showTeam = true }: { session: F1Session; showTeam?: boolean }) {
  if (session.drivers.length === 0) return null;

  const visible = session.drivers.slice(0, 10);

  return (
    <div className="flex flex-col">
      {visible.map((driver, i) => {
        const safeColor = ensureContrast(driver.teamColor);
        const isPodium = session.type === 'Race' && driver.position <= 3;
        const isLast = i === visible.length - 1;

        return (
          <div
            key={`${session.type}-${driver.position}`}
            className={`flex items-center gap-component py-component ${
              isLast ? '' : 'border-b border-outline-subtle'
            }`}
          >
            <span className={`text-body-sm tabular-nums w-[28px] text-right shrink-0 ${
              driver.winner ? 'font-medium text-primary' : isPodium ? 'font-medium text-on-surface' : 'text-on-surface-variant'
            }`}>
              {driver.position}
            </span>

            {safeColor && (
              <div
                className="w-[3px] h-[20px] rounded-full shrink-0"
                style={{ backgroundColor: `#${safeColor}` }}
              />
            )}

            {driver.flagUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={driver.flagUrl}
                alt={driver.flag}
                loading="lazy"
                className="size-icon-1 object-contain shrink-0"
              />
            )}

            <span className={`text-body-sm flex-1 min-w-0 truncate ${
              isPodium || driver.winner ? 'font-medium text-on-surface' : 'text-on-surface'
            }`}>
              {driver.name}
            </span>

            {showTeam && driver.team && (
              <span className="text-label-sm text-on-surface-variant shrink-0 hidden md:inline">
                {driver.team}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Collapsible session ---

function CollapsibleSession({ session, showTeam }: { session: F1Session; showTeam?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const topDriver = session.drivers[0];
  const label = SESSION_LABELS[session.type] ?? session.type;

  return (
    <>
      <ExpandToggle expanded={expanded} onToggle={() => setExpanded(!expanded)}>
        <span>{label}: {topDriver?.name ?? 'No results'}</span>
      </ExpandToggle>
      {expanded && (
        <div className="px-content py-group border-t border-outline-subtle">
          <SessionTable session={session} showTeam={showTeam} />
        </div>
      )}
    </>
  );
}

// --- Main component ---

export function F1RecapCard({ weekend, date }: { weekend: F1Weekend; date?: string }) {
  // Primary session: Race if present, otherwise the most important session
  const raceSession = weekend.sessions.find(s => s.type === 'Race');
  const qualSession = weekend.sessions.find(s => s.type === 'Qual');
  const primarySession = raceSession ?? qualSession;
  const secondarySessions = weekend.sessions.filter(s => s !== primarySession && s.drivers.length > 0);
  const flagUrl = getCircuitFlagUrl(weekend.city);

  return (
    <Card variant="outline" size="sm" className="!p-0 gap-0 overflow-hidden">
      <CardContent className="flex flex-col gap-0">
        {/* Header: event name + circuit with country flag backdrop */}
        <div
          className="relative flex flex-col gap-component-compact px-content py-component"
          style={flagUrl ? { backgroundImage: `url(${flagUrl})`, backgroundSize: '115%', backgroundPosition: 'center' } : undefined}
        >
          {/* Flag overlay scrim */}
          {flagUrl && <div className="absolute inset-0 bg-surface-1/90 pointer-events-none" />}
          <h4 className="relative text-body-md font-medium text-on-surface">
            {weekend.eventName}
          </h4>
          <div className="relative flex items-center gap-component-compact text-label-sm text-on-surface-variant">
            <MapPin className="size-icon-0 shrink-0" />
            <span>{weekend.circuit} — {weekend.city}</span>
          </div>
        </div>

        {/* Primary session (always expanded) */}
        {primarySession && primarySession.drivers.length > 0 && (
          <div className="flex flex-col border-t border-outline-subtle px-content py-component">
            <div className="flex items-center gap-component pb-component">
              {primarySession.headline && (
                <span className="text-label-sm text-on-surface-variant">{primarySession.headline}</span>
              )}
            </div>
            <SessionTable session={primarySession} />
          </div>
        )}

        {/* Secondary sessions (collapsible) */}
        {secondarySessions.map((session) => (
          <CollapsibleSession
            key={session.type}
            session={session}
            showTeam={session.type !== 'Qual'}
          />
        ))}
      </CardContent>
    </Card>
  );
}
