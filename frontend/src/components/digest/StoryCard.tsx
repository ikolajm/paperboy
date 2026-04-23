'use client';

import { useState } from 'react';
import type { RelatedArticle } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent } from '@/components/atoms/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getFaviconUrl } from '@/lib/media-bias';

interface StoryCardProps {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  sourceUrl?: string;
  author?: string;
  storyDate?: string;
  deepDiveEligible?: boolean;
  date?: string;
  relatedArticles?: RelatedArticle[];
  availableDeepDives?: string[];
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return '';
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return '';
}

function RelatedPreview({ articles }: { articles: RelatedArticle[] }) {
  return (
    <div className="flex items-center gap-component flex-wrap text-label-md text-on-surface-variant">
      <span>Also:</span>
      {articles.map((ra) => (
        <span key={ra.url} className="inline-flex items-center gap-1">
          {ra.outlet}
          {ra !== articles[articles.length - 1] && <span>·</span>}
        </span>
      ))}
    </div>
  );
}

function RelatedExpanded({ articles }: { articles: RelatedArticle[] }) {
  return (
    <div className="flex flex-col gap-component-compact pl-2 border-l-2 border-outline-subtle">
      {articles.map((ra) => (
        <div key={ra.url} className="flex items-center gap-component py-component-compact">
          <div className="flex items-center gap-component min-w-0">
            <span className="text-label-md text-on-surface-variant shrink-0">
              {ra.outlet}
            </span>
            <span className="text-label-md text-outline-subtle">|</span>
            <a
              href={ra.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-sm text-on-surface hover:text-primary transition-colors truncate"
            >
              {ra.headline}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StoryCard({
  id,
  title,
  url,
  snippet,
  source,
  sourceUrl,
  author,
  storyDate,
  relatedArticles,
}: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasRelated = relatedArticles && relatedArticles.length > 0;
  const timeAgo = storyDate ? formatTimeAgo(storyDate) : '';

  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-component">
        <div className="flex flex-col gap-component min-w-0">
          {/* Top row: ID + outlet + time */}
          <div className="flex items-center gap-component">
            <Badge variant="neutral" size="sm">
              {id}
            </Badge>
            <span className="text-label-md text-outline-subtle">|</span>
            {sourceUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={getFaviconUrl(sourceUrl)}
                alt=""
                className="size-icon-2 shrink-0"
              />
            )}
            {source && (
              <span className="text-label-md text-on-surface-variant">
                {source}
              </span>
            )}
            {timeAgo && (
              <>
                <span className="text-label-md text-outline-subtle">·</span>
                <span className="text-label-md text-on-surface-variant">{timeAgo}</span>
              </>
            )}
          </div>

          {/* Headline — is the link */}
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

          {/* Author */}
          {author && (
            <span className="text-label-sm text-on-surface-variant">
              By {author}
            </span>
          )}

          {/* Snippet */}
          {snippet && (
            <p className="text-body-sm text-on-surface-variant line-clamp-2">
              {snippet}
            </p>
          )}

          {/* Related articles: preview + expandable */}
          {hasRelated && (
            <div className="flex flex-col gap-component">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                trailingIcon={expanded ? <ChevronUp /> : <ChevronDown />}
                className="self-start text-on-surface-variant"
              >
                <RelatedPreview articles={relatedArticles} />
              </Button>
              {expanded && (
                <RelatedExpanded articles={relatedArticles} />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
