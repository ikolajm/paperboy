import type { EntertainmentSection as EntertainmentType } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardContent } from '@/components/atoms/Card';
import { Film } from 'lucide-react';

function ScoreBadge({ score, voteCount }: { score: number; voteCount?: number }) {
  const variant =
    score >= 7 ? 'success' : score >= 5 ? 'warning' : 'destructive';
  return (
    <Badge variant={variant} size="sm">
      {score.toFixed(1)}{voteCount ? ` (${voteCount.toLocaleString()})` : ''}
    </Badge>
  );
}

function MediaCard({
  id,
  title,
  overview,
  score,
  voteCount,
  posterUrl,
  genres,
}: {
  id: string;
  title: string;
  overview: string;
  score: number;
  voteCount?: number;
  posterUrl?: string;
  genres?: string[];
}) {
  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-2">
        {/* Poster or placeholder */}
        <div className="w-full aspect-[2/3] rounded-md overflow-hidden bg-surface-1">
          {posterUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
              <Film className="size-icon-3" />
            </div>
          )}
        </div>

        {/* ID + score */}
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm">
            {id}
          </Badge>
          <ScoreBadge score={score} voteCount={voteCount} />
        </div>

        {/* Title */}
        <p className="text-body-md font-medium text-on-surface leading-snug">
          {title}
        </p>

        {/* Genres */}
        {genres && genres.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {genres.map((genre) => (
              <Badge key={genre} variant="neutral" size="sm">
                {genre}
              </Badge>
            ))}
          </div>
        )}

        {/* Overview */}
        {overview && (
          <p className="text-body-sm text-on-surface-variant line-clamp-3">
            {overview}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function EntertainmentSection({ data }: { data: EntertainmentType; date?: string; availableDeepDives?: string[] }) {
  const { movies, streaming } = data;
  if (movies.length === 0 && streaming.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      {movies.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-title-md font-semibold text-on-surface">
            In Theatres
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {movies.map((m) => (
              <MediaCard
                key={m.id}
                id={m.id}
                title={m.title}
                overview={m.overview}
                score={m.vote_average}
                voteCount={m.vote_count}
                posterUrl={m.poster_url}
                genres={m.genres}
              />
            ))}
          </div>
        </div>
      )}
      {streaming.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-title-md font-semibold text-on-surface">
            Streaming Buzz
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {streaming.map((s) => (
              <MediaCard
                key={s.id}
                id={s.id}
                title={s.title}
                overview={s.overview}
                score={s.vote_average}
                voteCount={s.vote_count}
                posterUrl={s.poster_url}
                genres={s.genres}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
