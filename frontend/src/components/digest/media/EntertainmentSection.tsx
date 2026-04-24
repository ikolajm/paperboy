import type { EntertainmentSection as EntertainmentType } from '@/types';
import { Film, Tv, CalendarClock } from 'lucide-react';
import { PosterGallery } from './PosterGallery';

export function EntertainmentSection({ data }: { data: EntertainmentType }) {
  const { movies, streaming, upcoming = [] } = data;
  if (movies.length === 0 && streaming.length === 0 && upcoming.length === 0) return null;

  return (
    <div className="flex flex-col gap-section-compact">
      {movies.length > 0 && (
        <div className="flex flex-col gap-group">
          <h3 className="flex items-center gap-group text-title-md text-on-surface">
            <Film className="size-icon-2 text-on-surface-variant shrink-0" />
            In Theatres
          </h3>
          <PosterGallery items={movies} />
        </div>
      )}
      {streaming.length > 0 && (
        <div className="flex flex-col gap-group">
          <h3 className="flex items-center gap-group text-title-md text-on-surface">
            <Tv className="size-icon-2 text-on-surface-variant shrink-0" />
            Streaming Buzz
          </h3>
          <PosterGallery items={streaming} />
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="flex flex-col gap-group">
          <h3 className="flex items-center gap-group text-title-md text-on-surface">
            <CalendarClock className="size-icon-2 text-on-surface-variant shrink-0" />
            Coming Soon
          </h3>
          <PosterGallery items={upcoming} />
        </div>
      )}
    </div>
  );
}
