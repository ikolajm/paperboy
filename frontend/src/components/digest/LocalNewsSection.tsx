import type { LocalSection } from '@/types';
import { StoryCard } from './StoryCard';
import { MapPin } from 'lucide-react';

export function LocalNewsSection({ data }: { data: LocalSection }) {
  const locations = data.locations.filter((loc) => loc.stories.length > 0);
  if (locations.length === 0) return null;

  return (
    <div className="flex flex-col gap-section-compact">
      {locations.map((location) => (
        <div key={location.label} className="flex flex-col gap-group">
          <h3 className="flex items-center gap-group text-title-md text-on-surface">
            <MapPin className="size-icon-2 text-on-surface-variant shrink-0" />
            {location.label}
          </h3>
          <div className="flex flex-col gap-component">
            {location.stories.map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                url={story.url}
                snippet={story.snippet}
                source={story.source}
                sourceUrl={story.source_url}
                storyDate={story.date}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
