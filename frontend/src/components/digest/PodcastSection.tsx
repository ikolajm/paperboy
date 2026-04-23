import type { Podcast } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardContent } from '@/components/atoms/Card';
import { Clock, ExternalLink, Play, Mic } from 'lucide-react';

function PodcastCard({ entry }: { entry: Podcast }) {
  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-2">
        {/* Artwork or placeholder */}
        <div className="w-full aspect-square rounded-md overflow-hidden bg-surface-1">
          {entry.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={entry.image_url}
              alt={entry.show}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
              <Mic className="size-icon-3" />
            </div>
          )}
        </div>

        {/* ID + duration */}
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm">
            {entry.id}
          </Badge>
          <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
            <Clock className="size-icon-0" />
            {entry.duration}
          </span>
        </div>

        {/* Show name */}
        <span className="text-label-md text-on-surface-variant">
          {entry.show}
        </span>

        {/* Title — links to episode */}
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
          <p className="text-body-md font-medium text-on-surface leading-snug">
            {entry.title}
          </p>
        )}

        {/* Snippet */}
        {entry.snippet && (
          <p className="text-body-sm text-on-surface-variant line-clamp-3">
            {entry.snippet}
          </p>
        )}

        {/* Action links */}
        {(entry.youtube_url || entry.transcript_url) && (
          <div className="flex items-center gap-3">
            {entry.youtube_url && (
              <a
                href={entry.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <Play className="size-icon-0" />
                <span>YouTube</span>
              </a>
            )}
            {entry.transcript_url && (
              <a
                href={entry.transcript_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <ExternalLink className="size-icon-0" />
                <span>Transcript</span>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PodcastSection({ podcasts }: { podcasts: Podcast[]; date?: string; availableDeepDives?: string[] }) {
  if (podcasts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-title-md font-semibold text-on-surface">Podcasts</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {podcasts.map((entry) => (
          <PodcastCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
