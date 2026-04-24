'use client';

import { useState } from 'react';
import type { RelatedArticle } from '@/types';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent } from '@/components/atoms/Card';
import { ChevronDown, ChevronUp, Newspaper, UserRound } from 'lucide-react';
import { getFaviconUrl } from '@/lib/media-bias';
import { formatTimeAgo } from '@/lib/format';

interface StoryCardProps {
  id: string;
  title: string;
  url: string | null;
  snippet?: string;
  source: string;
  sourceUrl?: string;
  author?: string;
  storyDate?: string;
  deepDiveEligible?: boolean;
  date?: string;
  relatedArticles?: RelatedArticle[];
  availableDeepDives?: string[];
}

function RelatedList({ articles }: { articles: RelatedArticle[] }) {
  return (
    <div className="flex flex-col gap-component-compact">
      {articles.map((ra) => (
        <div key={ra.url} className="flex flex-col gap-component-compact rounded-component bg-surface-1 px-group py-component">
          <a
            href={ra.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-sm text-on-surface hover:text-primary transition-colors"
          >
            {ra.headline}
          </a>
          <span className="text-label-sm text-on-surface-variant">
            {ra.outlet}
          </span>
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

  // Attribution logic: prefer a real author over source.
  // author === source (e.g. "ESPN") or staff bylines are not real authors.
  const trimmedAuthor = author?.trim() || '';
  const trimmedSource = source?.trim() || '';
  const isRealAuthor = trimmedAuthor !== ''
    && trimmedAuthor.toLowerCase() !== trimmedSource.toLowerCase()
    && !trimmedAuthor.toLowerCase().includes('staff');
  const hasSourceUrl = !!sourceUrl;

  // What to display and which icon to use
  let attribution: string;
  let attributionIcon: 'author' | 'favicon' | 'outlet';

  if (isRealAuthor) {
    attribution = trimmedAuthor;
    attributionIcon = 'author';
  } else if (trimmedSource) {
    attribution = trimmedSource;
    attributionIcon = hasSourceUrl ? 'favicon' : 'outlet';
  } else {
    attribution = '';
    attributionIcon = 'outlet';
  }

  return (
    <Card variant="outline" size="sm">
      <CardContent className="flex flex-col gap-component">
        <div className="flex flex-col gap-component min-w-0">
          {/* Meta row: attribution + time */}
          <div className="flex items-center gap-component">
            {attribution && (
              <>
                {attributionIcon === 'author' ? (
                  <UserRound className="size-icon-1 shrink-0 text-on-surface-variant" />
                ) : attributionIcon === 'favicon' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getFaviconUrl(sourceUrl!)}
                    alt=""
                    className="size-icon-2 shrink-0"
                  />
                ) : (
                  <Newspaper className="size-icon-1 shrink-0 text-on-surface-variant" />
                )}
                <span className="text-label-md text-on-surface-variant">
                  {attribution}
                </span>
              </>
            )}
            {timeAgo && (
              <>
                <span className="text-label-md text-outline-subtle">·</span>
                <span className="text-label-md text-on-surface-variant">{timeAgo}</span>
              </>
            )}
          </div>

          {/* Headline — linked when url present, muted when absent */}
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
            <p className="text-body-md font-medium text-on-surface-variant leading-snug">
              {title}
            </p>
          )}

          {/* Snippet — only when present */}
          {snippet?.trim() && (
            <p className="text-body-sm text-on-surface-variant line-clamp-2">
              {snippet}
            </p>
          )}

          {/* Related articles: toggle + expandable list */}
          {hasRelated && (
            <div className="flex flex-col gap-component">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                trailingIcon={expanded ? <ChevronUp /> : <ChevronDown />}
                className="self-start text-on-surface-variant"
              >
                Related articles
              </Button>
              {expanded && (
                <RelatedList articles={relatedArticles} />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
