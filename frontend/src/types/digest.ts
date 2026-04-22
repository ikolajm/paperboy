import type { StoryId, DateString, Timestamp } from "./common";
import type { PopularToday, LocalSection, TopicGroup, Opinion } from "./editorial";
import type { Podcast } from "./podcasts";
import type { EntertainmentSection } from "./entertainment";
import type { TeamSports } from "./team-sports";
import type { UFCSection } from "./ufc";
import type { F1Section } from "./f1";

export interface DigestMeta {
  date: DateString;
  day_of_week: string;
  story_count: number;
  run_mode: "initial" | "refresh";
  last_run: Timestamp;
}

export interface DeepDiveEntry {
  id: StoryId;
  file: string;
  title: string;
}

export interface ScoresSection {
  team_sports: TeamSports;
  ufc: UFCSection;
  f1: F1Section;
}

export interface DigestSections {
  popular_today: PopularToday;
  local: LocalSection;
  for_you: TopicGroup[];
  on_your_radar: TopicGroup[];
  podcasts: Podcast[];
  entertainment: EntertainmentSection;
  opinions: Opinion[];
  scores: ScoresSection;
}

export interface Digest {
  meta: DigestMeta;
  sections: DigestSections;
  deep_dives: DeepDiveEntry[];
}
