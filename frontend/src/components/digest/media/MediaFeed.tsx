'use client';

import { useState } from 'react';
import type { DigestSections } from '@/types';
import { Chip } from '@/components/atoms/Chip';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Clapperboard, Podcast, Film, Tv, CalendarClock } from 'lucide-react';
import { PodcastSection } from './PodcastSection';
import { EntertainmentSection } from './EntertainmentSection';

type MediaCategory = 'podcasts' | 'movies' | 'streaming' | 'upcoming';

const MEDIA_CATEGORIES: { key: MediaCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'podcasts', label: 'Podcasts', icon: <Podcast /> },
  { key: 'movies', label: 'Movies', icon: <Film /> },
  { key: 'streaming', label: 'Streaming', icon: <Tv /> },
  { key: 'upcoming', label: 'Coming Soon', icon: <CalendarClock /> },
];

function getSectionCount(sections: DigestSections, key: MediaCategory): number {
  switch (key) {
    case 'podcasts':
      return sections.podcasts.length;
    case 'movies':
      return sections.entertainment.movies.length;
    case 'streaming':
      return sections.entertainment.streaming.length;
    case 'upcoming':
      return (sections.entertainment.upcoming ?? []).length;
  }
}

export function MediaFeed({
  sections,
}: {
  sections: DigestSections | null;
}) {
  const [active, setActive] = useState<MediaCategory | null>(null);

  function selectCategory(key: MediaCategory | null) {
    setActive(active === key ? null : key);
  }

  const isVisible = (key: MediaCategory) => !active || active === key;

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
    <div className="flex flex-col gap-section">
      <div className="flex flex-wrap gap-component">
        <Chip
          variant={!active ? 'selected' : 'unselected'}
          size="sm"
          onClick={() => selectCategory(null)}
        >
          All
        </Chip>
        {MEDIA_CATEGORIES.map((cat) => (
          <Chip
            key={cat.key}
            variant={active === cat.key ? 'selected' : 'unselected'}
            size="sm"
            leadingIcon={cat.icon}
            onClick={() => selectCategory(cat.key)}
          >
            {cat.label} ({getSectionCount(sections, cat.key)})
          </Chip>
        ))}
      </div>
      <div className="flex flex-col gap-section">
        {isVisible('podcasts') && sections.podcasts.length > 0 && (
          <section>
            <PodcastSection podcasts={sections.podcasts} />
          </section>
        )}
        {(isVisible('movies') || isVisible('streaming') || isVisible('upcoming')) && (
          <section>
            <EntertainmentSection
              data={{
                movies: isVisible('movies') ? sections.entertainment.movies : [],
                streaming: isVisible('streaming') ? sections.entertainment.streaming : [],
                upcoming: isVisible('upcoming') ? (sections.entertainment.upcoming ?? []) : [],
              }}
            />
          </section>
        )}
      </div>
    </div>
  );
}
