import type { TopicGroup } from '@/types';
import { StoryCard } from './StoryCard';
import { Calendar, Podcast } from 'lucide-react';

export function TopicSection({
  section,
  date,
  icon,
  availableDeepDives = [],
}: {
  section: TopicGroup;
  date: string;
  icon?: React.ReactNode;
  availableDeepDives?: string[];
}) {
  const { topic, stories, calendar_event, cross_refs, quiet } = section;

  return (
    <div className="flex flex-col gap-group">
      <h3 className="flex items-center gap-group text-title-md text-on-surface">
        {icon && <span className="size-icon-2 text-on-surface-variant shrink-0 [&>svg]:size-full">{icon}</span>}
        {topic}
      </h3>

      {quiet ? (
        <p className="text-body-sm text-on-surface-variant italic">
          Nothing notable today.
        </p>
      ) : (
        <div className="flex flex-col gap-component">
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
        <div className="flex items-center gap-component text-body-sm text-on-surface-variant">
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
        <div className="flex flex-col gap-component-compact">
          {cross_refs.map((ref) => (
            <div
              key={`${ref.show}-${ref.episode_title}`}
              className="flex items-center gap-component text-body-sm text-on-surface-variant"
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
