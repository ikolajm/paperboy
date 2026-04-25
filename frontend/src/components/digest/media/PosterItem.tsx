'use client';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/atoms/HoverCard';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from '@/components/atoms/Dialog';
import { Film, X } from 'lucide-react';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { WatchProvider } from '@/types';

interface PosterItemProps {
  id: string;
  title: string;
  overview: string;
  score: number;
  voteCount?: number;
  posterUrl?: string;
  genres?: string[];
  watchProviders?: WatchProvider[];
  releaseDate?: string;
  deepDiveEligible?: boolean;
  date?: string;
  availableDeepDives?: string[];
}

// --- Helpers ---

function ScoreBadge({ score, voteCount }: { score: number; voteCount?: number }) {
  const variant =
    score >= 7 ? 'success' : score >= 5 ? 'warning' : 'destructive';
  return (
    <Badge variant={variant} size="sm" className="w-auto">
      {score.toFixed(1)}{voteCount ? ` (${voteCount.toLocaleString()})` : ''}
    </Badge>
  );
}

function simplifyProviderName(name: string): string {
  return name
    .replace(/ Standard with Ads$/i, '')
    .replace(/ with Ads$/i, '')
    .replace(/ Amazon Channel$/i, '')
    .replace(/ Roku Premium Channel$/i, '')
    .replace(/^Amazon Prime Video$/i, 'Prime')
    .replace(/^HBO Max$/i, 'Max');
}

function isUnreleased(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr + 'T00:00:00') > new Date();
}

function formatReleaseDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// --- Subcomponents ---

function PosterImage({ posterUrl, title }: { posterUrl?: string; title: string }) {
  return (
    <div className="w-[160px] shrink-0 aspect-[2/3] rounded-card overflow-hidden bg-surface-1">
      {posterUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
          <Film className="size-icon-4" />
        </div>
      )}
    </div>
  );
}

function DetailContent({
  id,
  title,
  overview,
  score,
  voteCount,
  genres,
  watchProviders,
  releaseDate,
  deepDiveEligible,
  date,
  availableDeepDives,
  showTitle = true,
}: Omit<PosterItemProps, 'posterUrl'> & { showTitle?: boolean }) {
  const unreleased = isUnreleased(releaseDate);

  return (
    <div className="flex flex-col gap-component">
      {showTitle && (
        <p className="text-body-md font-medium text-on-surface leading-snug">
          {title}
        </p>
      )}

      <div className="flex items-center gap-component flex-wrap">
        <ScoreBadge score={score} voteCount={voteCount} />
        {unreleased && releaseDate && (
          <Badge variant="info" size="sm" className="w-auto">
            Coming {formatReleaseDate(releaseDate)}
          </Badge>
        )}
      </div>

      {genres && genres.length > 0 && (
        <div className="flex items-center gap-component-compact flex-wrap">
          {genres.map((genre) => (
            <Badge key={genre} variant="neutral" size="sm">
              {genre}
            </Badge>
          ))}
        </div>
      )}

      {overview?.trim() && (
        <p className="text-body-sm text-on-surface-variant line-clamp-3">
          {overview}
        </p>
      )}

      {watchProviders && watchProviders.length > 0 && (
        <div className="flex items-center gap-component">
          {watchProviders
            .filter((p) => p.logo_url)
            .map((p) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={p.provider_name}
                src={p.logo_url}
                alt={simplifyProviderName(p.provider_name)}
                title={simplifyProviderName(p.provider_name)}
                className="size-icon-3 rounded-component shrink-0"
              />
            ))}
        </div>
      )}

    </div>
  );
}

// --- Main component ---

export function PosterItem({
  id,
  title,
  overview,
  score,
  voteCount,
  posterUrl,
  genres,
  watchProviders,
  releaseDate,
  deepDiveEligible,
  date,
  availableDeepDives,
}: PosterItemProps) {
  const canHover = useMediaQuery('(hover: hover)');

  const detailProps = { id, title, overview, score, voteCount, genres, watchProviders, releaseDate, deepDiveEligible, date, availableDeepDives };

  if (canHover) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <button type="button" className="cursor-pointer">
            <PosterImage posterUrl={posterUrl} title={title} />
          </button>
        </HoverCardTrigger>
        <HoverCardContent size="md" sideOffset={8}>
          <DetailContent {...detailProps} />
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="cursor-pointer">
          <PosterImage posterUrl={posterUrl} title={title} />
        </button>
      </DialogTrigger>
      <DialogContent size="sm">
        <div className="flex items-center justify-between gap-component">
          <DialogTitle>{title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" iconOnly title="Close">
              <X />
            </Button>
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">Details for {title}</DialogDescription>
        <DetailContent {...detailProps} showTitle={false} />
      </DialogContent>
    </Dialog>
  );
}
