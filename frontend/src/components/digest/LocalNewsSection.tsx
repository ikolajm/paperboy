import type { LocalSection } from '@/types';
import { StoryCard } from './StoryCard';
import { MapPin } from 'lucide-react';

export function LocalNewsSection({ data }: { data: LocalSection }) {
  const locations = data.locations.filter((loc) => loc.stories.length > 0);
  if (locations.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      {locations.map((location) => (
        <div key={location.label} className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-title-md font-semibold text-on-surface">
            <MapPin className="size-icon-1 text-on-surface-variant shrink-0" />
            {location.label}
          </h3>
          <div className="flex flex-col gap-2">
            {location.stories.map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                url={story.url}
                snippet={story.snippet}
                source={story.source}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
