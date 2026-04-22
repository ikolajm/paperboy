import type { StoryId, DateString } from "./common";

export interface Movie {
  id: StoryId;
  title: string;
  overview: string;
  release_date: DateString;
  vote_average: number;
  deep_dive_eligible?: boolean;
}

export interface StreamingShow {
  id: StoryId;
  title: string;
  overview: string;
  vote_average: number;
  first_air_date: DateString;
  deep_dive_eligible?: boolean;
}

export interface EntertainmentSection {
  movies: Movie[];
  streaming: StreamingShow[];
}
