'use client';

import { useState } from 'react';
import type { DigestSections } from '@/types';
import { Chip } from '@/components/atoms/Chip';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Newspaper } from 'lucide-react';
import { PopularTodaySection } from './PopularTodaySection';
import { TopicSection } from './TopicSection';
import { OpinionsSection } from './OpinionsSection';
import { LocalNewsSection } from './LocalNewsSection';

type NewsCategory =
  | 'top_stories'
  | 'for_you'
  | 'radar'
  | 'opinions'
  | 'local';

const NEWS_CATEGORIES: { key: NewsCategory; label: string }[] = [
  { key: 'top_stories', label: 'Top Stories' },
  { key: 'for_you', label: 'For You' },
  { key: 'radar', label: 'On Your Radar' },
  { key: 'opinions', label: 'Opinions' },
  { key: 'local', label: 'Local' },
];

function getSectionCount(sections: DigestSections, key: NewsCategory): string {
  switch (key) {
    case 'top_stories': {
      const p = sections.popular_today;
      const total = p.top_stories.length + p.world.length + p.nation.length;
      return `${total}`;
    }
    case 'for_you':
      return `${sections.for_you.length}`;
    case 'radar':
      return `${sections.on_your_radar.length}`;
    case 'opinions':
      return `${sections.opinions.length}`;
    case 'local':
      return `${sections.local.locations.length}`;
  }
}

function renderSection(sections: DigestSections, key: NewsCategory, date: string, availableDeepDives: string[]) {
  switch (key) {
    case 'top_stories':
      return <PopularTodaySection data={sections.popular_today} date={date} availableDeepDives={availableDeepDives} />;
    case 'for_you':
      return (
        <div className="flex flex-col gap-6">
          {sections.for_you.map((section) => (
            <TopicSection key={section.topic} section={section} date={date} availableDeepDives={availableDeepDives} />
          ))}
        </div>
      );
    case 'radar':
      return (
        <div className="flex flex-col gap-6">
          {sections.on_your_radar.map((section) => (
            <TopicSection key={section.topic} section={section} date={date} availableDeepDives={availableDeepDives} />
          ))}
        </div>
      );
    case 'opinions':
      return <OpinionsSection opinions={sections.opinions} />;
    case 'local':
      return <LocalNewsSection data={sections.local} />;
  }
}

export function NewsFeed({
  sections,
  date,
  availableDeepDives = [],
}: {
  sections: DigestSections | null;
  date: string;
  availableDeepDives?: string[];
}) {
  const [showAll, setShowAll] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<NewsCategory>>(
    () => new Set<NewsCategory>()
  );

  function selectAll() {
    setShowAll(true);
    setActiveFilters(new Set());
  }

  function toggleFilter(key: NewsCategory) {
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

  const visibleCategories = showAll
    ? NEWS_CATEGORIES
    : NEWS_CATEGORIES.filter((cat) => activeFilters.has(cat.key));

  if (!sections) {
    return (
      <EmptyState
        icon={<Newspaper />}
        heading="No news data"
        description="Select a date with a digest to see stories."
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
        {NEWS_CATEGORIES.map((cat) => {
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
        {visibleCategories.map((cat) => (
          <section key={cat.key}>
            {renderSection(sections, cat.key, date, availableDeepDives)}
          </section>
        ))}
      </div>
    </div>
  );
}
