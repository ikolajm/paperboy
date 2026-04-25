'use client';

import { useRef } from 'react';
import { Button } from '@/components/atoms/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PosterItem } from './PosterItem';
import type { WatchProvider } from '@/types';

interface GalleryItem {
  id: string;
  title: string;
  overview: string;
  vote_average: number;
  vote_count?: number;
  poster_url?: string;
  genres?: string[];
  watch_providers?: WatchProvider[];
  release_date?: string;
  first_air_date?: string;
  deep_dive_eligible?: boolean;
}

export function PosterGallery({ items, date, availableDeepDives }: { items: GalleryItem[]; date?: string; availableDeepDives?: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }

  return (
    <div className="relative group">
      {/* Left arrow */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={() => scroll('left')}
          className="bg-surface/80 backdrop-blur-sm"
        >
          <ChevronLeft />
        </Button>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-group overflow-x-auto scroll-smooth scrollbar-none"
      >
        {items.map((item) => (
          <PosterItem
            key={item.id}
            id={item.id}
            title={item.title}
            overview={item.overview}
            score={item.vote_average}
            voteCount={item.vote_count}
            posterUrl={item.poster_url}
            genres={item.genres}
            watchProviders={item.watch_providers}
            releaseDate={item.release_date ?? item.first_air_date}
            deepDiveEligible={item.deep_dive_eligible}
            date={date}
            availableDeepDives={availableDeepDives}
          />
        ))}
      </div>

      {/* Right arrow */}
      <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={() => scroll('right')}
          className="bg-surface/80 backdrop-blur-sm"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
