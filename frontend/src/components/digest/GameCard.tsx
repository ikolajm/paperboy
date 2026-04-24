import type { Game, GameLeader } from '@/types';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';

function TeamRow({
  logo,
  abbreviation,
  record,
  score,
  isWinner,
}: {
  logo: string;
  abbreviation: string;
  record: string;
  score: number;
  isWinner: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-component">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={abbreviation} className="size-icon-3 object-contain" />
        <span
          className={`text-body-md ${isWinner ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}
        >
          {abbreviation}
        </span>
        <span className="text-label-sm text-on-surface-variant">{record}</span>
      </div>
      <span
        className={`text-body-md tabular-nums ${isWinner ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}
      >
        {score}
      </span>
    </div>
  );
}

function LeadersRow({ leaders }: { leaders: GameLeader[] }) {
  if (leaders.length === 0) return null;

  const categories = ['Pts', 'Reb', 'Ast'];
  const displayed = categories
    .map((cat) => leaders.find((l) => l.shortName === cat))
    .filter(Boolean) as GameLeader[];

  if (displayed.length === 0) return null;

  return (
    <div className="flex gap-group text-label-sm text-on-surface-variant">
      {displayed.map((l) => (
        <span key={`${l.shortName}-${l.athlete}`}>
          {l.shortName}: {l.athlete} {l.displayValue}
        </span>
      ))}
    </div>
  );
}

export function GameCard({ game }: { game: Game }) {
  const homeWon = game.homeScore > game.awayScore;
  const awayWon = game.awayScore > game.homeScore;

  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-component">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-component">
            <Badge variant="neutral" size="sm">
              {game.status}
            </Badge>
            {game.notes.length > 0 && (
              <span className="text-label-sm text-on-surface-variant">
                {game.notes[0]}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-component-compact">
          <TeamRow
            logo={game.away.logo}
            abbreviation={game.away.abbreviation}
            record={game.away.records.total ?? ''}
            score={game.awayScore}
            isWinner={awayWon}
          />
          <TeamRow
            logo={game.home.logo}
            abbreviation={game.home.abbreviation}
            record={game.home.records.total ?? ''}
            score={game.homeScore}
            isWinner={homeWon}
          />
        </div>

        {game.headline && (
          <p className="text-body-sm text-on-surface-variant line-clamp-2">
            {game.headline}
          </p>
        )}

        <LeadersRow leaders={game.leaders} />
      </CardContent>
    </Card>
  );
}
