'use client';

import { useState } from 'react';
import type { DigestSections } from '@/types';
import { Chip } from '@/components/atoms/Chip';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Clapperboard } from 'lucide-react';
import { PodcastSection } from './PodcastSection';
import { EntertainmentSection } from './EntertainmentSection';

type MediaCategory = 'podcasts' | 'movies' | 'streaming';

const MEDIA_CATEGORIES: { key: MediaCategory; label: string }[] = [
  { key: 'podcasts', label: 'Podcasts' },
  { key: 'movies', label: 'Movies' },
  { key: 'streaming', label: 'Streaming' },
];

function getSectionCount(sections: DigestSections, key: MediaCategory): string {
  switch (key) {
    case 'podcasts':
      return `${sections.podcasts.length}`;
    case 'movies':
      return `${sections.entertainment.movies.length}`;
    case 'streaming':
      return `${sections.entertainment.streaming.length}`;
  }
}

export function MediaFeed({
  sections,
}: {
  sections: DigestSections | null;
}) {
  const [showAll, setShowAll] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<MediaCategory>>(
    () => new Set<MediaCategory>()
  );

  function selectAll() {
    setShowAll(true);
    setActiveFilters(new Set());
  }

  function toggleFilter(key: MediaCategory) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        if (next.size === 0) {
          setShowAll(true);
          return next;
        }
      } else {
        next.add(key);
        setShowAll(false);
      }
      return next;
    });
  }

  const isVisible = (key: MediaCategory) => showAll || activeFilters.has(key);

  if (!sections) {
    return (
      <EmptyState
        icon={<Clapperboard />}
        heading="No media data"
        description="Select a date with a digest to see podcasts and entertainment."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Chip
          variant={showAll ? 'selected' : 'unselected'}
          size="sm"
          onClick={selectAll}
        >
          All
        </Chip>
        {MEDIA_CATEGORIES.map((cat) => {
          const count = getSectionCount(sections, cat.key);
          return (
            <Chip
              key={cat.key}
              variant={!showAll && activeFilters.has(cat.key) ? 'selected' : 'unselected'}
              size="sm"
              onClick={() => toggleFilter(cat.key)}
            >
              {cat.label} ({count})
            </Chip>
          );
        })}
      </div>
      <div className="flex flex-col gap-8">
        {isVisible('podcasts') && sections.podcasts.length > 0 && (
          <section>
            <PodcastSection podcasts={sections.podcasts} />
          </section>
        )}
        {isVisible('movies') && sections.entertainment.movies.length > 0 && (
          <section>
            <EntertainmentSection
              data={{ movies: sections.entertainment.movies, streaming: [] }}
            />
          </section>
        )}
        {isVisible('streaming') && sections.entertainment.streaming.length > 0 && (
          <section>
            <EntertainmentSection
              data={{ movies: [], streaming: sections.entertainment.streaming }}
            />
          </section>
        )}
      </div>
    </div>
  );
}
