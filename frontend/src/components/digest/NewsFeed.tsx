'use client';

import { useMemo, useState } from 'react';
import type { DigestSections, TopicGroup } from '@/types';
import { Chip } from '@/components/atoms/Chip';
import { EmptyState } from '@/components/atoms/EmptyState';
import {
  Globe, Lightbulb, Trophy, MessageSquareQuote,
  Flame, MapPin, Landmark, Brain, ShieldAlert,
  FlaskConical, HeartPulse, Newspaper,
} from 'lucide-react';
import { PopularTodaySection } from './PopularTodaySection';
import { TopicSection } from './TopicSection';
import { OpinionsSection } from './OpinionsSection';
import { LocalNewsSection } from './LocalNewsSection';

// --- Tier 1 categories ---

type PrimaryCategory = 'headlines' | 'topics' | 'sports' | 'opinions';

const PRIMARY_CATEGORIES: { key: PrimaryCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'headlines', label: 'Headlines', icon: <Globe /> },
  { key: 'topics', label: 'Topics', icon: <Lightbulb /> },
  { key: 'sports', label: 'Sports', icon: <Trophy /> },
  { key: 'opinions', label: 'Opinions', icon: <MessageSquareQuote /> },
];

// --- Tier 2 sub-filters ---

interface SubFilter {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

const HEADLINE_SUBS: SubFilter[] = [
  { key: 'top_stories', label: 'Top Stories', icon: <Flame /> },
  { key: 'local', label: 'Local', icon: <MapPin /> },
];

const TOPIC_SUBS: Record<string, { label: string; icon: React.ReactNode }> = {
  'US Politics': { label: 'US Politics', icon: <Landmark /> },
  'AI': { label: 'AI', icon: <Brain /> },
  'Cybersecurity': { label: 'Cybersecurity', icon: <ShieldAlert /> },
  'Science': { label: 'Science', icon: <FlaskConical /> },
  'Health': { label: 'Health', icon: <HeartPulse /> },
};

// --- Helpers ---

function getAllTopics(sections: DigestSections): TopicGroup[] {
  return [...sections.for_you, ...sections.on_your_radar];
}

function countStories(topics: TopicGroup[]): number {
  return topics.reduce((sum, t) => sum + t.stories.length, 0);
}

// --- Component ---

export function NewsFeed({
  sections,
  date,
  availableDeepDives = [],
}: {
  sections: DigestSections | null;
  date: string;
  availableDeepDives?: string[];
}) {
  const [activePrimary, setActivePrimary] = useState<PrimaryCategory | null>(null);
  const [hiddenSubs, setHiddenSubs] = useState<Set<string>>(() => new Set());

  const topicsByCategory = useMemo(() => {
    if (!sections) return { topics: [], sports: [] };
    const all = getAllTopics(sections);
    return {
      topics: all.filter((t) => t.category !== 'SPRT'),
      sports: all.filter((t) => t.category === 'SPRT'),
    };
  }, [sections]);

  // Tier 2 sub-filters derived from data for sports (dynamic per digest)
  const sportSubs = useMemo<SubFilter[]>(() => {
    return topicsByCategory.sports.map((t) => ({
      key: t.topic,
      label: t.topic,
    }));
  }, [topicsByCategory.sports]);

  // Tier 2 sub-filters for topics (dynamic per digest, with icon lookup)
  const topicSubs = useMemo<SubFilter[]>(() => {
    return topicsByCategory.topics.map((t) => ({
      key: t.topic,
      label: TOPIC_SUBS[t.topic]?.label ?? t.topic,
      icon: TOPIC_SUBS[t.topic]?.icon,
    }));
  }, [topicsByCategory.topics]);

  function selectPrimary(key: PrimaryCategory | null) {
    setActivePrimary(key);
    setHiddenSubs(new Set());
  }

  function toggleSub(subKey: string) {
    setHiddenSubs((prev) => {
      const next = new Set(prev);
      if (next.has(subKey)) {
        next.delete(subKey);
      } else {
        next.add(subKey);
      }
      return next;
    });
  }

  function getSubFilters(): SubFilter[] | null {
    switch (activePrimary) {
      case 'headlines': return HEADLINE_SUBS;
      case 'topics': return topicSubs;
      case 'sports': return sportSubs;
      default: return null;
    }
  }

  function isSubVisible(subKey: string): boolean {
    return !hiddenSubs.has(subKey);
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

  // --- Section counts ---

  function getPrimaryCount(key: PrimaryCategory): number {
    switch (key) {
      case 'headlines': {
        const localCount = sections!.local.locations.reduce(
          (sum, loc) => sum + loc.stories.length, 0,
        );
        return sections!.popular_today.length + localCount;
      }
      case 'topics':
        return countStories(topicsByCategory.topics);
      case 'sports':
        return countStories(topicsByCategory.sports);
      case 'opinions':
        return sections!.opinions.length;
    }
  }

  // --- Rendering ---

  function renderHeadlines() {
    return (
      <div className="flex flex-col gap-section-compact">
        {isSubVisible('top_stories') && sections!.popular_today.length > 0 && (
          <div className="flex flex-col gap-group">
            <h3 className="flex items-center gap-group text-title-md text-on-surface">
              <Flame className="size-icon-2 text-on-surface-variant shrink-0" />
              Today&apos;s Top Stories
            </h3>
            <PopularTodaySection data={sections!.popular_today} date={date} availableDeepDives={availableDeepDives} />
          </div>
        )}
        {isSubVisible('local') && (
          <LocalNewsSection data={sections!.local} />
        )}
      </div>
    );
  }

  function renderTopics() {
    const visible = topicsByCategory.topics.filter((t) => isSubVisible(t.topic));
    if (visible.length === 0) return null;
    return (
      <div className="flex flex-col gap-section">
        {visible.map((section) => (
          <TopicSection key={section.topic} section={section} date={date} icon={TOPIC_SUBS[section.topic]?.icon} availableDeepDives={availableDeepDives} />
        ))}
      </div>
    );
  }

  function renderSports() {
    const visible = topicsByCategory.sports.filter((t) => isSubVisible(t.topic));
    if (visible.length === 0) return null;
    return (
      <div className="flex flex-col gap-section">
        {visible.map((section) => (
          <TopicSection key={section.topic} section={section} date={date} availableDeepDives={availableDeepDives} />
        ))}
      </div>
    );
  }

  function renderSection(key: PrimaryCategory) {
    switch (key) {
      case 'headlines': return renderHeadlines();
      case 'topics': return renderTopics();
      case 'sports': return renderSports();
      case 'opinions': return <OpinionsSection opinions={sections!.opinions} />;
    }
  }

  const visiblePrimaries = activePrimary
    ? PRIMARY_CATEGORIES.filter((c) => c.key === activePrimary)
    : PRIMARY_CATEGORIES;

  const subFilters = getSubFilters();

  return (
    <div className="flex flex-col gap-section">
      {/* Tier 1 */}
      <div className="flex flex-col gap-component">
        <div className="flex flex-wrap gap-component">
          <Chip
            variant={!activePrimary ? 'selected' : 'unselected'}
            size="sm"
            onClick={() => selectPrimary(null)}
          >
            All
          </Chip>
          {PRIMARY_CATEGORIES.map((cat) => (
            <Chip
              key={cat.key}
              variant={activePrimary === cat.key ? 'selected' : 'unselected'}
              size="sm"
              leadingIcon={cat.icon}
              onClick={() => selectPrimary(activePrimary === cat.key ? null : cat.key)}
            >
              {cat.label} ({getPrimaryCount(cat.key)})
            </Chip>
          ))}
        </div>

        {/* Tier 2 */}
        {subFilters && subFilters.length > 0 && (
          <div className="flex flex-wrap gap-component">
            {subFilters.map((sub) => (
              <Chip
                key={sub.key}
                variant={isSubVisible(sub.key) ? 'selected' : 'unselected'}
                size="sm"
                leadingIcon={sub.icon}
                onClick={() => toggleSub(sub.key)}
              >
                {sub.label}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-section">
        {visiblePrimaries.map((cat) => (
          <section key={cat.key}>
            {renderSection(cat.key)}
          </section>
        ))}
      </div>
    </div>
  );
}
