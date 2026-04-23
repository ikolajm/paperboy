import type { PopularToday } from '@/types';
import { StoryCard } from './StoryCard';

const SUBSECTIONS: { key: keyof PopularToday; label: string }[] = [
  { key: 'top_stories', label: 'Top Stories' },
  { key: 'world', label: 'World' },
  { key: 'nation', label: 'Nation' },
];

export function PopularTodaySection({
  data,
  date,
  availableDeepDives = [],
}: {
  data: PopularToday;
  date: string;
  availableDeepDives?: string[];
}) {
  return (
    <div className="flex flex-col gap-5">
      {SUBSECTIONS.map(({ key, label }) => {
        const stories = data[key];
        if (stories.length === 0) return null;
        return (
          <div key={key} className="flex flex-col gap-2">
            <h3 className="text-title-md font-semibold text-on-surface">
              {label}
            </h3>
            <div className="flex flex-col gap-2">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  id={story.id}
                  title={story.title}
                  url={story.url}
                  snippet={story.snippet}
                  source={story.source}
                  sourceUrl={story.source_url}
                  storyDate={story.date}
                  deepDiveEligible={story.deep_dive_eligible}
                  date={date}
                  relatedArticles={story.related_articles}
                  availableDeepDives={availableDeepDives}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
