import type { PopularToday } from '@/types';
import { StoryCard } from './StoryCard';

export function PopularTodaySection({
  data,
  date,
  availableDeepDives = [],
}: {
  data: PopularToday;
  date: string;
  availableDeepDives?: string[];
}) {
  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-component">
      {data.map((story) => (
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
  );
}
