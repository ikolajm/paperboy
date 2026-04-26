/**
 * Assemble For You and On Your Radar topic sections from RSS results.
 */

import type { PaperboyConfig } from "../../shared/types/config.js";
import type { RssEntry, Story, TopicSection } from "../../shared/types/digest.js";
import { filterEntries, DedupPool } from "./filter.js";
import { IdCounter } from "./ids.js";

function rssToStory(entry: RssEntry, id: string): Story {
  return {
    id,
    title: entry.title,
    url: entry.url || null,
    snippet: entry.snippet,
    source: entry.source,
    source_url: entry.source_url,
    author: entry.author,
    date: entry.date,
    deep_dive_eligible: true,
    google_news_redirect: entry.google_news_redirect,
    related_articles: entry.related_articles,
  };
}

export function assembleTopics(
  results: Record<string, RssEntry[]>,
  config: PaperboyConfig,
  ids: IdCounter,
): { forYou: TopicSection[]; onYourRadar: TopicSection[] } {
  const forYou: TopicSection[] = [];
  const onYourRadar: TopicSection[] = [];

  // Shared dedup pool across all topics — prevents the same story
  // from appearing in both AI and Cybersecurity, or College Football and NFL
  const topicPool = new DedupPool();

  for (const [name, topic] of Object.entries(config.topics)) {
    // Collect all RSS entries for this topic across its feeds
    const allEntries: RssEntry[] = [];
    for (let i = 0; i < topic.rss.length; i++) {
      const key = `TOPIC_${name}_${i}`;
      const entries = results[key] ?? [];
      allEntries.push(...entries);
    }

    // Filter with shared pool and cap
    const max = topic.mode === "active" ? 5 : 3;
    const filtered = filterEntries(allEntries, 36, topicPool).slice(0, max);

    const stories = filtered.map(e => rssToStory(e, ids.next(topic.category)));

    const section: TopicSection = {
      topic: name,
      category: topic.category,
      mode: topic.mode,
      stories,
      calendar_event: null,
      cross_refs: [],
      quiet: stories.length === 0,
    };

    if (topic.mode === "active") {
      forYou.push(section);
    } else {
      onYourRadar.push(section);
    }
  }

  return { forYou, onYourRadar };
}
