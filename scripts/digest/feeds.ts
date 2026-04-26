/**
 * Builds the RSS batch config from config.json.
 * Determines which feeds to fetch based on topic settings,
 * podcast release schedules, and section configuration.
 */

import type { PaperboyConfig, PodcastShow } from "../../shared/types/config.js";
import type { RssBatchItem } from "../../shared/types/digest.js";

// --- Podcast schedule filtering ---

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function shouldFetchPodcast(show: PodcastShow, date: Date): boolean {
  if (!show.release_schedule) return true;

  const dayName = DAY_NAMES[date.getDay()];

  switch (show.release_schedule) {
    case "daily": return true;
    case "weekdays": return date.getDay() >= 1 && date.getDay() <= 5;
    case "weekly_monday": return dayName === "monday";
    case "mon_wed_fri": return ["monday", "wednesday", "friday"].includes(dayName);
    case "mon_thu": return ["monday", "thursday"].includes(dayName);
    default: return true;
  }
}

// --- Build batch ---

export function buildFeedBatch(config: PaperboyConfig, targetDate: Date): RssBatchItem[] {
  const feeds: RssBatchItem[] = [];

  // Popular Today
  const pop = config.popular_today;
  feeds.push({ label: "POP_top", url: pop.top_stories.rss, max: pop.top_stories.max });
  feeds.push({ label: "POP_world", url: pop.world.rss, max: pop.world.max });
  feeds.push({ label: "POP_nation", url: pop.nation.rss, max: pop.nation.max });

  // Local News
  for (const loc of config.local_news.locations) {
    feeds.push({ label: `LOCAL_${loc.label}`, url: loc.rss, max: config.local_news.max_stories_per_location });
  }

  // Topics
  for (const [name, topic] of Object.entries(config.topics)) {
    const max = topic.mode === "active" ? 5 : 3;
    for (let i = 0; i < topic.rss.length; i++) {
      feeds.push({ label: `TOPIC_${name}_${i}`, url: topic.rss[i], max });
    }
  }

  // Podcasts (schedule-filtered)
  for (const [name, show] of Object.entries(config.podcasts.shows)) {
    if (shouldFetchPodcast(show, targetDate)) {
      feeds.push({ label: `POD_${name}`, url: show.rss, max: 1 });
    }
  }

  // Opinions
  for (let i = 0; i < config.opinions.feeds.length; i++) {
    feeds.push({ label: `OPN_${i}`, url: config.opinions.feeds[i], max: config.opinions.max_stories });
  }

  return feeds;
}
