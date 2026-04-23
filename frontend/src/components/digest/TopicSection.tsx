import type { TopicGroup } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { StoryCard } from './StoryCard';
import { Calendar, Podcast } from 'lucide-react';

export function TopicSection({ section, date, availableDeepDives = [] }: { section: TopicGroup; date: string; availableDeepDives?: string[] }) {
  const { topic, category, mode, stories, calendar_event, cross_refs, quiet } =
    section;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-title-md font-semibold text-on-surface">{topic}</h3>
        <Badge variant="default" size="sm">
          {category}
        </Badge>
        {mode === 'passive' && (
          <Badge variant="neutral" size="sm">
            Watching
          </Badge>
        )}
      </div>

      {quiet ? (
        <p className="text-body-sm text-on-surface-variant italic">
          Nothing notable today.
        </p>
      ) : (
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
              author={story.author}
              storyDate={story.date}
              deepDiveEligible={story.deep_dive_eligible}
              date={date}
              relatedArticles={story.related_articles}
              availableDeepDives={availableDeepDives}
            />
          ))}
        </div>
      )}

      {calendar_event && (
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <Calendar className="size-icon-0 shrink-0" />
          <span>
            {calendar_event.label} — {calendar_event.date}
            {calendar_event.days_away === 0
              ? ' (today)'
              : calendar_event.days_away === 1
                ? ' (tomorrow)'
                : ` (${calendar_event.days_away} days)`}
          </span>
        </div>
      )}

      {cross_refs.length > 0 && (
        <div className="flex flex-col gap-1">
          {cross_refs.map((ref) => (
            <div
              key={`${ref.show}-${ref.episode_title}`}
              className="flex items-center gap-2 text-body-sm text-on-surface-variant"
            >
              <Podcast className="size-icon-0 shrink-0" />
              <span>
                Related podcast: {ref.show} — &ldquo;{ref.episode_title}&rdquo;
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
