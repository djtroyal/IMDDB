import { Movie, CastMember } from "@/types";

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY!;

export async function searchMovies(query: string): Promise<Movie[]> {
  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);
  const data = await res.json();
  return data.results as Movie[];
}

export async function getMovieDetails(movieId: number): Promise<Movie> {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB movie details failed: ${res.status}`);
  return res.json();
}

export interface RawCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

/** Fast: single API call, returns basic cast info without birth/death details */
export async function getRawCast(movieId: number): Promise<RawCastMember[]> {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits&language=en-US`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB credits failed: ${res.status}`);
  const data = await res.json();
  return data.credits?.cast ?? [];
}

export async function getPersonDetails(personId: number): Promise<{
  birthday: string | null;
  deathday: string | null;
}> {
  const url = `${BASE_URL}/person/${personId}?api_key=${API_KEY}&language=en-US`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return { birthday: null, deathday: null };
  const data = await res.json();
  return {
    birthday: data.birthday ?? null,
    deathday: data.deathday ?? null,
  };
}

export async function getPersonBiography(personId: number): Promise<string | null> {
  const url = `${BASE_URL}/person/${personId}?api_key=${API_KEY}&language=en-US`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.biography ?? null;
}

export function calcAgeAtDeath(birthday: string, deathday: string): number {
  const birth = new Date(birthday);
  const death = new Date(deathday);
  let age = death.getFullYear() - birth.getFullYear();
  const m = death.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && death.getDate() < birth.getDate())) age--;
  return age;
}

export function calcCurrentAge(birthday: string): number {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/** Enrich a batch of raw cast with person details. Fetches all in parallel. */
export async function enrichCastBatch(raw: RawCastMember[]): Promise<CastMember[]> {
  const allDetails = await Promise.all(
    raw.map((m) => getPersonDetails(m.id))
  );

  return raw.map((m, i) => {
    const d = allDetails[i];
    const age_at_death =
      d.birthday && d.deathday ? calcAgeAtDeath(d.birthday, d.deathday) : null;
    const current_age =
      d.birthday && !d.deathday ? calcCurrentAge(d.birthday) : null;
    return {
      id: m.id,
      name: m.name,
      character: m.character,
      profile_path: m.profile_path,
      order: m.order,
      birthday: d.birthday,
      deathday: d.deathday,
      age_at_death,
      current_age,
      biography: null,
    };
  });
}
