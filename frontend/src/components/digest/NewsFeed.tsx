'use client';

import { useState } from 'react';
import type { DigestSections } from '@/types';
import { Chip } from '@/components/atoms/Chip';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/atoms/Card';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Newspaper } from 'lucide-react';

type NewsCategory =
  | 'top_stories'
  | 'for_you'
  | 'radar'
  | 'podcasts'
  | 'entertainment'
  | 'opinions'
  | 'local';

const NEWS_CATEGORIES: { key: NewsCategory; label: string }[] = [
  { key: 'top_stories', label: 'Top Stories' },
  { key: 'for_you', label: 'For You' },
  { key: 'radar', label: 'On Your Radar' },
  { key: 'podcasts', label: 'Podcasts' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'opinions', label: 'Opinions' },
  { key: 'local', label: 'Local' },
];

function getSectionCount(sections: DigestSections, key: NewsCategory): string {
  switch (key) {
    case 'top_stories': {
      const p = sections.popular_today;
      const total = p.top_stories.length + p.world.length + p.nation.length;
      return `${total} stories`;
    }
    case 'for_you':
      return `${sections.for_you.length} topics`;
    case 'radar':
      return `${sections.on_your_radar.length} topics`;
    case 'podcasts':
      return `${sections.podcasts.length} episodes`;
    case 'entertainment': {
      const e = sections.entertainment;
      return `${e.movies.length} movies, ${e.streaming.length} shows`;
    }
    case 'opinions':
      return `${sections.opinions.length} opinions`;
    case 'local':
      return `${sections.local.locations.length} locations`;
  }
}

export function NewsFeed({
  sections,
}: {
  sections: DigestSections | null;
}) {
  const [activeFilters, setActiveFilters] = useState<Set<NewsCategory>>(
    () => new Set(NEWS_CATEGORIES.map((c) => c.key))
  );

  function toggleFilter(key: NewsCategory) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

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
        {NEWS_CATEGORIES.map((cat) => (
          <Chip
            key={cat.key}
            variant={activeFilters.has(cat.key) ? 'selected' : 'unselected'}
            size="sm"
            onClick={() => toggleFilter(cat.key)}
          >
            {cat.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {NEWS_CATEGORIES.filter((cat) => activeFilters.has(cat.key)).map(
          (cat) => (
            <Card key={cat.key} variant="outline" size="sm">
              <CardHeader>
                <CardTitle>{cat.label}</CardTitle>
                <CardDescription>
                  {getSectionCount(sections, cat.key)}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
