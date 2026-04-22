import Link from 'next/link';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardContent } from '@/components/atoms/Card';
import { ExternalLink, Search } from 'lucide-react';

interface StoryCardProps {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  deepDiveEligible?: boolean;
  date?: string;
}

export function StoryCard({
  id,
  title,
  url,
  snippet,
  source,
  deepDiveEligible,
  date,
}: StoryCardProps) {
  const hasDeepDive = deepDiveEligible && date;

  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="neutral" size="sm">
                {id}
              </Badge>
              {source && (
                <span className="text-label-sm text-on-surface-variant">
                  {source}
                </span>
              )}
            </div>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-md font-medium text-on-surface hover:text-primary transition-colors leading-snug"
              >
                {title}
              </a>
            ) : (
              <p className="text-body-md font-medium text-on-surface leading-snug">
                {title}
              </p>
            )}
            {snippet && (
              <p className="text-body-sm text-on-surface-variant line-clamp-2">
                {snippet}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-1">
            {hasDeepDive && (
              <Link
                href={`/deep-dive/${date}/${id}`}
                className="flex items-center gap-1 text-label-sm text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
              >
                <Search className="size-icon-0" />
                <span>Deep dive</span>
              </Link>
            )}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                title="Open article"
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
