import type { F1Weekend } from '@/types';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';

export function F1RecapCard({ weekend }: { weekend: F1Weekend }) {
  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-body-md font-semibold text-on-surface">
            {weekend.eventName}
          </p>
          <span className="text-label-sm text-on-surface-variant">
            {weekend.circuit} — {weekend.city}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {weekend.sessions
            .filter((s) => s.drivers.length > 0)
            .map((session) => (
              <div key={session.type} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm">
                    {session.type}
                  </Badge>
                  {session.headline && (
                    <span className="text-label-sm text-on-surface-variant">
                      {session.headline}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  {session.drivers.slice(0, 5).map((driver) => (
                    <div
                      key={`${session.type}-${driver.position}`}
                      className="flex items-center justify-between py-0.5 text-body-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface-variant tabular-nums w-5 text-right">
                          {driver.position}.
                        </span>
                        <span
                          className={
                            driver.winner
                              ? 'font-semibold text-on-surface'
                              : 'text-on-surface'
                          }
                        >
                          {driver.name}
                        </span>
                      </div>
                      <span className="text-label-sm text-on-surface-variant">
                        {driver.team}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
