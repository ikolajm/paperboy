import { ExternalLink } from 'lucide-react';

export function GameDetailLink({
  date,
  gameId,
  label = 'View full game details',
}: {
  date: string;
  gameId: string;
  label?: string;
}) {
  return (
    <a
      href={`/scores/${date}/${gameId}`}
      className="inline-flex items-center gap-component-compact text-label-sm text-primary hover:text-on-surface transition-colors self-start"
    >
      <ExternalLink className="size-icon-0" />
      {label}
    </a>
  );
}
