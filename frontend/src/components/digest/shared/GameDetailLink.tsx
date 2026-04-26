import { buttonVariants } from '@/components/atoms/Button';
import { cn } from '@/components/atoms/cn';
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
      className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-primary self-start')}
    >
      <ExternalLink className="size-icon-1 shrink-0" />
      {label}
    </a>
  );
}
