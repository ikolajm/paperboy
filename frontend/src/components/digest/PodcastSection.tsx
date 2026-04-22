import Link from 'next/link';
import type { Podcast } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardContent } from '@/components/atoms/Card';
import { ExternalLink, Clock, Search } from 'lucide-react';

function PodcastCard({ entry, date }: { entry: Podcast; date: string }) {
  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="info" size="sm">
                {entry.id}
              </Badge>
              <span className="text-label-sm font-medium text-on-surface-variant">
                {entry.show}
              </span>
            </div>
            <p className="text-body-md font-medium text-on-surface leading-snug">
              {entry.title}
            </p>
            <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Clock className="size-icon-0" />
                {entry.duration}
              </span>
            </div>
            {entry.snippet && (
              <p className="text-body-sm text-on-surface-variant line-clamp-2">
                {entry.snippet}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-1">
            {entry.deep_dive_eligible && (
              <Link
                href={`/deep-dive/${date}/${entry.id}`}
                className="flex items-center gap-1 text-label-sm text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
              >
                <Search className="size-icon-0" />
                <span>Transcript</span>
              </Link>
            )}
            {entry.episode_url && (
              <a
                href={entry.episode_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                title="Listen"
              >
                <ExternalLink className="size-icon-1" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PodcastSection({ podcasts, date }: { podcasts: Podcast[]; date: string }) {
  if (podcasts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-title-md font-semibold text-on-surface">Podcasts</h3>
      <div className="flex flex-col gap-2">
        {podcasts.map((entry) => (
          <PodcastCard key={entry.id} entry={entry} date={date} />
        ))}
      </div>
    </div>
  );
}
