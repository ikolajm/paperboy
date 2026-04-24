/**
 * Canonical types for the Paperboy digest pipeline.
 * Used by both scripts/ and frontend/.
 *
 * Domain types live in their own modules. This file re-exports everything
 * and defines the top-level Digest assembly types.
 */

// --- Domain re-exports ---

export * from "./editorial.js";
export * from "./scores.js";
export * from "./enrichment.js";
export * from "./ufc.js";
export * from "./f1.js";
export * from "./entertainment.js";
export * from "./podcasts.js";
export * from "./rss.js";

// --- Deep Dives ---

export interface DeepDiveRef {
  id: string;
  file: string;
  title: string;
}

// --- Top-level digest ---

import type { SportRecaps, SportSchedule } from "./scores.js";
import type { UfcRecaps, UfcSchedule } from "./ufc.js";
import type { F1Recaps, F1Schedule } from "./f1.js";
import type { PopularTodaySection, LocalSection, TopicSection } from "./editorial.js";
import type { EntertainmentSection } from "./entertainment.js";
import type { PodcastEntry } from "./podcasts.js";
import type { OpinionEntry } from "./editorial.js";

export interface DigestMeta {
  date: string;
  day_of_week: string;
  story_count: number;
  run_mode: "initial";
  last_run: string;
}

export interface ScoresSection {
  /** Team sports (NBA, NHL, MLB, NFL, College) */
  team_sports: {
    recaps: SportRecaps[];
    schedule: SportSchedule[];
  };
  /** UFC/MMA fight cards */
  ufc: {
    recaps: UfcRecaps;
    schedule: UfcSchedule;
  };
  /** F1 race weekends */
  f1: {
    recaps: F1Recaps;
    schedule: F1Schedule;
  };
}

export interface DigestSections {
  popular_today: PopularTodaySection;
  local: LocalSection;
  for_you: TopicSection[];
  on_your_radar: TopicSection[];
  scores: ScoresSection;
  entertainment: EntertainmentSection;
  podcasts: PodcastEntry[];
  opinions: OpinionEntry[];
}

export interface Digest {
  meta: DigestMeta;
  sections: DigestSections;
  deep_dives: DeepDiveRef[];
}
