'use client';

import type { F1Weekend } from '@/types';
import { Card, CardContent } from '@/components/atoms/Card';
import { MapPin, Clock } from 'lucide-react';
import { getCircuitFlagUrl } from './f1-flags';

// --- Session type labels ---

const SESSION_LABELS: Record<string, string> = {
  Race: 'Race',
  Qual: 'Qualifying',
  FP1: 'Practice 1',
  FP2: 'Practice 2',
  FP3: 'Practice 3',
  SS: 'Sprint Qualifying',
  SR: 'Sprint Race',
};

export function F1ScheduleCard({ weekend }: { weekend: F1Weekend }) {
  const sessionsWithTimes = weekend.sessions.filter(s => s.status);
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

        {/* Session schedule */}
        {sessionsWithTimes.length > 0 && (
          <div className="flex flex-col border-t border-outline-subtle px-content py-component">
            {sessionsWithTimes.map((session, i) => {
              const isRace = session.type === 'Race';
              const isLast = i === sessionsWithTimes.length - 1;

              return (
                <div
                  key={session.type}
                  className={`flex items-center gap-component py-component ${
                    isLast ? '' : 'border-b border-outline-subtle'
                  }`}
                >
                  <span className={`text-body-sm flex-1 ${isRace ? 'font-medium text-on-surface' : 'text-on-surface'}`}>
                    {SESSION_LABELS[session.type] ?? session.type}
                  </span>
                  <span className={`text-body-sm tabular-nums ${isRace ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
                    {session.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
