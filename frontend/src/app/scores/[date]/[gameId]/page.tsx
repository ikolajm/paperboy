import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getGame } from '@/lib/digest';
import { ArrowLeft } from 'lucide-react';
import { GameDetailView } from '@/components/digest/scores/GameDetailView';

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ date: string; gameId: string }>;
}) {
  const { date, gameId } = await params;
  const result = await getGame(date, gameId);

  if (!result) {
    notFound();
  }

  const { game, sport, type } = result;

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-10 border-b border-outline-subtle bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-group px-content py-component">
          <Link
            href={`/?date=${date}&tab=scores`}
            className="flex items-center gap-component-compact text-label-md text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="size-icon-1" />
            Back to scores
          </Link>
          <span className="text-label-sm text-on-surface-variant">
            {sport} · {date}
          </span>
        </div>
      </header>
      <main>
        <GameDetailView game={game} sport={sport} date={date} type={type} />
      </main>
    </div>
  );
}
