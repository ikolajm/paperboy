import Link from 'next/link';
import { getDeepDive } from '@/lib/digest';
import { ArrowLeft } from 'lucide-react';
import { DeepDiveView } from './DeepDiveView';

export default async function DeepDivePage({
  params,
}: {
  params: Promise<{ date: string; id: string }>;
}) {
  const { date, id } = await params;
  const deepDive = await getDeepDive(date, id);

  return (
    <div className="min-h-dvh bg-surface-0">
      <header className="sticky top-0 z-10 border-b border-outline-subtle bg-surface-0/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-3">
          <Link
            href={`/?date=${date}`}
            className="flex items-center gap-1.5 text-label-md text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to digest
          </Link>
          <span className="text-label-sm text-on-surface-variant">
            {date} · {id}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <DeepDiveView date={date} id={id} initialContent={deepDive?.content ?? null} />
      </main>
    </div>
  );
}
