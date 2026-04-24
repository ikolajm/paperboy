import type { UFCCard } from '@/types';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';

function FightRow({
  fighter1,
  fighter2,
  weightClass,
  method,
  rounds,
}: {
  fighter1: { name: string; record: string; winner: boolean };
  fighter2: { name: string; record: string; winner: boolean };
  weightClass: string;
  method: string;
  rounds: number;
}) {
  const winner = fighter1.winner ? fighter1 : fighter2.winner ? fighter2 : null;
  const loser = fighter1.winner ? fighter2 : fighter2.winner ? fighter1 : null;

  return (
    <div className="flex items-center justify-between gap-component py-component-compact border-b border-outline-subtle last:border-b-0">
      <div className="flex flex-col gap-component-compact min-w-0">
        {winner && loser ? (
          <span className="text-body-sm">
            <span className="font-medium text-on-surface">{winner.name}</span>
            <span className="text-on-surface-variant"> def. </span>
            <span className="text-on-surface-variant">{loser.name}</span>
          </span>
        ) : (
          <span className="text-body-sm text-on-surface">
            {fighter1.name} vs. {fighter2.name}
          </span>
        )}
        <span className="text-label-sm text-on-surface-variant">
          {weightClass}
        </span>
      </div>
      <div className="flex items-center gap-component shrink-0">
        {method && (
          <span className="text-label-sm text-on-surface-variant">
            {method} · R{rounds}
          </span>
        )}
      </div>
    </div>
  );
}

export function UFCRecapCard({ card }: { card: UFCCard }) {
  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-component">
        <div className="flex flex-col gap-component-compact">
          <p className="text-body-md font-medium text-on-surface">
            {card.eventName}
          </p>
          <div className="flex items-center gap-component text-label-sm text-on-surface-variant">
            <span>{card.venue}</span>
            {card.broadcasts.length > 0 && (
              <>
                <span>·</span>
                <span>{card.broadcasts.join(', ')}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          {card.fights.map((fight) => (
            <FightRow
              key={fight.id}
              fighter1={fight.fighter1}
              fighter2={fight.fighter2}
              weightClass={fight.weightClass}
              method={fight.method}
              rounds={fight.rounds}
            />
          ))}
        </div>
        <Badge variant="neutral" size="sm" className="self-start">
          {card.fights.length} fights
        </Badge>
      </CardContent>
    </Card>
  );
}
