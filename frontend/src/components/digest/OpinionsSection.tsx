import type { Opinion } from '@/types';
import { StoryCard } from './StoryCard';
import { MessageSquareQuote } from 'lucide-react';

export function OpinionsSection({ opinions }: { opinions: Opinion[] }) {
  if (opinions.length === 0) return null;

  return (
    <div className="flex flex-col gap-group">
      <h3 className="flex items-center gap-group text-title-md text-on-surface">
        <MessageSquareQuote className="size-icon-2 text-on-surface-variant shrink-0" />
        Opinions
      </h3>
      <div className="flex flex-col gap-component">
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
