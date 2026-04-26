'use client';

import type { Fight, Fighter, FightStats } from '@/types';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/atoms/Sheet';
import { Badge } from '@/components/atoms/Badge';

// --- Method badge ---

function MethodBadge({ fight }: { fight: Fight }) {
  const parts: string[] = [];
  if (fight.method && fight.method !== 'Final') parts.push(fight.method);
  if (fight.methodDetail) parts.push(`(${fight.methodDetail})`);
  // if (fight.endRound) {
  //   const time = fight.endTime && fight.endTime !== '5:00' ? ` ${fight.endTime}` : '';
  //   parts.push(`R${fight.endRound}${time}`);
  // }

  if (parts.length === 0) return null;

  const isFinish = fight.method === 'KO/TKO' || fight.method === 'Submission';

  return (
    <Badge variant={isFinish ? 'destructive' : 'neutral'} size="md">
      {parts.join(' ')}
    </Badge>
  );
}

// --- Fighter profile ---

function FighterProfile({ fighter, side }: { fighter: Fighter; side: 'left' | 'right' }) {
  const isLeft = side === 'left';

  return (
    <div className={`flex-1 flex flex-col items-center gap-component-compact ${isLeft ? '' : ''}`}>
      {/* Headshot */}
      {fighter.headshot ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={fighter.headshot}
          alt={fighter.name}
          className="size-[72px] md:size-[88px] rounded-full object-cover bg-surface-1"
        />
      ) : (
        <div className="size-[72px] md:size-[88px] rounded-full bg-surface-1 flex items-center justify-center text-on-surface-variant text-title-lg">
          {fighter.name.charAt(0)}
        </div>
      )}

      {/* Flag + Name */}
      <div className="flex items-center gap-component-compact">
        {fighter.flagUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={fighter.flagUrl} alt="" className="size-icon-1 object-contain shrink-0" />
        )}
        <span className={`text-body-sm font-medium text-on-surface text-center ${fighter.winner ? 'text-primary' : ''}`}>
          {fighter.name}
        </span>
      </div>

      {/* Record */}
      <span className="text-label-sm text-on-surface-variant">{fighter.record}</span>

      {/* Physical stats */}
      {(fighter.height || fighter.weight || fighter.reach) && (
        <div className="flex flex-col items-center text-label-sm text-on-surface-variant">
          {fighter.height && <span>{fighter.height}</span>}
          {fighter.weight && <span>{fighter.weight}</span>}
          {fighter.reach && <span>{fighter.reach} reach</span>}
        </div>
      )}
    </div>
  );
}

// --- Stat comparison row ---

function StatRow({ label, val1, val2, isLast = false }: {
  label: string;
  val1: string;
  val2: string;
  isLast?: boolean;
}) {
  const num1 = parseFloat(val1) || 0;
  const num2 = parseFloat(val2) || 0;
  const win1 = num1 > num2;
  const win2 = num2 > num1;

  return (
    <div className={`flex items-center py-component ${isLast ? '' : 'border-b border-outline-subtle'}`}>
      <span className={`text-body-sm tabular-nums w-[56px] text-left ${win1 ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
        {val1}
      </span>
      <span className="text-label-sm text-on-surface-variant text-center flex-1 select-none">
        {label}
      </span>
      <span className={`text-body-sm tabular-nums w-[56px] text-right ${win2 ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
        {val2}
      </span>
    </div>
  );
}

// --- Stat section ---

function StatsComparison({ stats1, stats2 }: { stats1: FightStats; stats2: FightStats }) {
  const rows: { label: string; val1: string; val2: string }[] = [
    { label: 'Knockdowns', val1: String(stats1.knockdowns), val2: String(stats2.knockdowns) },
    { label: 'Sig. Strikes', val1: `${stats1.sigStrikesLanded}/${stats1.sigStrikesAttempted}`, val2: `${stats2.sigStrikesLanded}/${stats2.sigStrikesAttempted}` },
    { label: 'Total Strikes', val1: `${stats1.totalStrikesLanded}/${stats1.totalStrikesAttempted}`, val2: `${stats2.totalStrikesLanded}/${stats2.totalStrikesAttempted}` },
    { label: 'Takedowns', val1: `${stats1.takedownsLanded}/${stats1.takedownsAttempted}`, val2: `${stats2.takedownsLanded}/${stats2.takedownsAttempted}` },
    { label: 'Sub. Attempts', val1: String(stats1.submissionAttempts), val2: String(stats2.submissionAttempts) },
    { label: 'Control Time', val1: stats1.controlTime, val2: stats2.controlTime },
  ];

  const targetRows: { label: string; val1: string; val2: string }[] = [
    { label: 'Head', val1: String(stats1.headStrikes), val2: String(stats2.headStrikes) },
    { label: 'Body', val1: String(stats1.bodyStrikes), val2: String(stats2.bodyStrikes) },
    { label: 'Legs', val1: String(stats1.legStrikes), val2: String(stats2.legStrikes) },
  ];

  return (
    <div className="flex flex-col gap-group">
      {/* Main stats */}
      <div className="flex flex-col rounded-card border border-outline-subtle overflow-hidden bg-surface-1 px-group">
        {rows.map((row, i) => (
          <StatRow key={row.label} label={row.label} val1={row.val1} val2={row.val2} isLast={i === rows.length - 1} />
        ))}
      </div>

      {/* Target breakdown */}
      <div className="flex flex-col gap-component">
        <span className="text-label-sm text-on-surface-variant text-center">Significant Strikes by Target</span>
        <div className="flex flex-col rounded-card border border-outline-subtle overflow-hidden bg-surface-1 px-group">
          {targetRows.map((row, i) => (
            <StatRow key={row.label} label={row.label} val1={row.val1} val2={row.val2} isLast={i === targetRows.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main export ---

export function FightDetailSheet({
  fight,
  children,
}: {
  fight: Fight;
  children: React.ReactNode;
}) {
  const hasStats = !!(fight.fighter1Stats && fight.fighter2Stats);
  const hasWinner = fight.fighter1.winner || fight.fighter2.winner;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" size="lg" className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{fight.weightClass}</SheetTitle>
          <SheetDescription>
            {fight.fighter1.name} vs. {fight.fighter2.name}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-section flex-1">
          {/* Fighter profiles */}
          <div className="flex items-start gap-group">
            <FighterProfile fighter={fight.fighter1} side="left" />
            <div className="flex flex-col items-center justify-center gap-component-compact pt-[36px] md:pt-[44px] shrink-0">
              {hasWinner ? (
                <span className="text-on-surface">
                  {fight.fighter1.winner ? '◀' : '▶'}
                </span>
              ) : (
                <span className="text-label-sm text-on-surface-variant">vs</span>
              )}
              <MethodBadge fight={fight} />
              {fight.endTime && fight.endTime !== '5:00' && <span className='text-label-md text-on-surface-variant'>{fight.endTime}</span>}
            </div>
            <FighterProfile fighter={fight.fighter2} side="right" />
          </div>

          {/* Stat comparison */}
          {hasStats ? (
            <StatsComparison stats1={fight.fighter1Stats!} stats2={fight.fighter2Stats!} />
          ) : (
            <div className="flex items-center justify-center py-section">
              <span className="text-body-sm text-on-surface-variant">No fight statistics available</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
