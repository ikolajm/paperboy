import type { Opinion } from '@/types';
import { StoryCard } from './StoryCard';

export function OpinionsSection({ opinions }: { opinions: Opinion[] }) {
  if (opinions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-title-md font-semibold text-on-surface">Opinions</h3>
      <div className="flex flex-col gap-2">
        {opinions.map((entry) => (
          <StoryCard
            key={entry.id}
            id={entry.id}
            title={entry.title}
            url={entry.url}
            snippet={entry.snippet}
            source={entry.source}
            sourceUrl={entry.source_url}
            storyDate={entry.date}
            relatedArticles={entry.related_articles}
          />
        ))}
      </div>
    </div>
  );
}
