export interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  birthday: string | null;
  deathday: string | null;
  age_at_death: number | null;
  current_age: number | null;
  biography: string | null;
}

export interface FindAGraveResult {
  cause_of_death: string | null;
  resting_place: string | null;
  memorial_url: string | null;
  error?: string;
}

export interface MovieStats {
  total_cast: number;
  deceased_count: number;
  living_count: number;
  percent_deceased: number;
  median_age_at_death: number | null;
  mean_age_at_death: number | null;
  earliest_death: { member: CastMember; date: string } | null;
  most_recent_death: { member: CastMember; date: string } | null;
  youngest_death: { member: CastMember; age: number } | null;
  oldest_death: { member: CastMember; age: number } | null;
  oldest_living: { member: CastMember; age: number } | null;
}

export interface MovieWithCast {
  movie: Movie;
  cast: CastMember[];
  stats: MovieStats;
}
