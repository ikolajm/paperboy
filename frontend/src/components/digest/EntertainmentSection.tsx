import Link from 'next/link';
import type { EntertainmentSection as EntertainmentType } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardContent } from '@/components/atoms/Card';
import { Search, BookOpen } from 'lucide-react';

function ScoreBadge({ score }: { score: number }) {
  const variant =
    score >= 7 ? 'success' : score >= 5 ? 'warning' : 'destructive';
  return (
    <Badge variant={variant} size="sm">
      {score.toFixed(1)}
    </Badge>
  );
}

function MediaCard({
  id,
  title,
  overview,
  score,
  deepDiveEligible,
  deepDiveExists,
  date,
}: {
  id: string;
  title: string;
  overview: string;
  score: number;
  deepDiveEligible: boolean;
  deepDiveExists: boolean;
  date: string;
}) {
  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="neutral" size="sm">
                {id}
              </Badge>
              <ScoreBadge score={score} />
            </div>
            <p className="text-body-md font-medium text-on-surface leading-snug">
              {title}
            </p>
            {overview && (
              <p className="text-body-sm text-on-surface-variant line-clamp-2">
                {overview}
              </p>
            )}
          </div>
          {deepDiveEligible && deepDiveExists && (
            <Link
              href={`/deep-dive/${date}/${id}`}
              className="flex items-center gap-1 text-label-sm text-primary hover:text-primary/80 transition-colors whitespace-nowrap shrink-0 pt-1"
            >
              <BookOpen className="size-icon-0" />
              <span>Read deep dive</span>
            </Link>
          )}
          {deepDiveEligible && !deepDiveExists && (
            <span className="flex items-center gap-1 text-label-sm text-on-surface-variant whitespace-nowrap shrink-0 pt-1">
              <Search className="size-icon-0" />
              <span>Generate deep dive</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function EntertainmentSection({ data, date, availableDeepDives = [] }: { data: EntertainmentType; date: string; availableDeepDives?: string[] }) {
  const { movies, streaming } = data;
  if (movies.length === 0 && streaming.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      {movies.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-title-md font-semibold text-on-surface">
            In Theatres
          </h3>
          <div className="flex flex-col gap-2">
            {movies.map((m) => (
              <MediaCard
                key={m.id}
                id={m.id}
                title={m.title}
                overview={m.overview}
                score={m.vote_average}
                deepDiveEligible={m.deep_dive_eligible}
                deepDiveExists={availableDeepDives.includes(m.id)}
                date={date}
              />
            ))}
          </div>
        </div>
      )}
      {streaming.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-title-md font-semibold text-on-surface">
            Streaming Buzz
          </h3>
          <div className="flex flex-col gap-2">
            {streaming.map((s) => (
              <MediaCard
                key={s.id}
                id={s.id}
                title={s.title}
                overview={s.overview}
                score={s.vote_average}
                deepDiveEligible={s.deep_dive_eligible}
                deepDiveExists={availableDeepDives.includes(s.id)}
                date={date}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
