import type { Podcast } from '@/types';
import { Card, CardContent } from '@/components/atoms/Card';
import { buttonVariants } from '@/components/atoms/Button';
import { cn } from '@/components/atoms/cn';
import { Clock, ExternalLink, Play, Mic, Podcast as PodcastIcon } from 'lucide-react';
import { formatTimeAgo } from '@/lib/format';

function PodcastRow({ entry, date, availableDeepDives }: { entry: Podcast; date?: string; availableDeepDives?: string[] }) {
  const timeAgo = entry.date ? formatTimeAgo(entry.date) : '';

  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex gap-group">
        {/* Thumbnail */}
        <div className="size-[64px] shrink-0 rounded-card overflow-hidden bg-surface-1">
          {entry.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={entry.image_url}
              alt={entry.show}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
              <Mic className="size-icon-3" />
            </div>
          )}
        </div>

        {/* Metadata column */}
        <div className="flex flex-col gap-component min-w-0">
          {/* Meta row: show + duration + time */}
          <div className="flex items-center gap-component flex-wrap">
            <span className="text-label-md text-on-surface-variant">
              {entry.show}
            </span>
            <span className="text-label-sm text-outline-subtle">|</span>
            <span className="flex items-center gap-component-compact text-label-sm text-on-surface-variant">
              <Clock className="size-icon-0" />
              {entry.duration}
            </span>
            {timeAgo && (
              <>
                <span className="text-label-sm text-outline-subtle">·</span>
                <span className="text-label-sm text-on-surface-variant">{timeAgo}</span>
              </>
            )}
          </div>

          {/* Title */}
          {entry.episode_url ? (
            <a
              href={entry.episode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-md font-medium text-on-surface hover:text-primary transition-colors leading-snug"
            >
              {entry.title}
            </a>
          ) : (
            <p className="text-body-md font-medium text-on-surface-variant leading-snug">
              {entry.title}
            </p>
          )}

          {/* Snippet */}
          {entry.snippet?.trim() && (
            <p className="text-body-sm text-on-surface-variant line-clamp-2">
              {entry.snippet}
            </p>
          )}

          {/* Action links */}
          <div className="flex items-center gap-component flex-wrap">
            {entry.audio_url && (
              <a href={entry.audio_url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-primary')}>
                <Play className="size-icon-1 shrink-0" />
                Listen
              </a>
            )}
            {entry.youtube_url && (
              <a href={entry.youtube_url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-primary')}>
                <Play className="size-icon-1 shrink-0" />
                YouTube
              </a>
            )}
            {entry.transcript_url && (
              <a href={entry.transcript_url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-primary')}>
                <ExternalLink className="size-icon-1 shrink-0" />
                Transcript
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PodcastSection({ podcasts, date, availableDeepDives }: { podcasts: Podcast[]; date?: string; availableDeepDives?: string[] }) {
  if (podcasts.length === 0) return null;

  return (
    <div className="flex flex-col gap-group">
      <h3 className="flex items-center gap-group text-title-md text-on-surface">
        <PodcastIcon className="size-icon-2 text-on-surface-variant shrink-0" />
        Podcasts
      </h3>
      <div className="flex flex-col gap-component">
        {podcasts.map((entry) => (
          <PodcastRow key={entry.id} entry={entry} date={date} availableDeepDives={availableDeepDives} />
        ))}
      </div>
    </div>
  );
}
