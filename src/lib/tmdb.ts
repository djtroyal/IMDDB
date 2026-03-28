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

async function getPersonDetails(personId: number): Promise<{
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

function calcAgeAtDeath(birthday: string, deathday: string): number {
  const birth = new Date(birthday);
  const death = new Date(deathday);
  let age = death.getFullYear() - birth.getFullYear();
  const m = death.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && death.getDate() < birth.getDate())) age--;
  return age;
}

function calcCurrentAge(birthday: string): number {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Max cast members to fetch details for (avoids huge request counts for ensemble films)
const MAX_CAST = 50;

export async function getCastWithDetails(movieId: number): Promise<CastMember[]> {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits&language=en-US`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB credits failed: ${res.status}`);
  const data = await res.json();

  // Cast only — no crew. Cap at MAX_CAST to limit API calls.
  const rawCast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }> = (data.credits?.cast ?? []).slice(0, MAX_CAST);

  // Fire ALL person detail requests in parallel (TMDB allows 40 req/s)
  const allDetails = await Promise.all(
    rawCast.map((m) => getPersonDetails(m.id))
  );

  return rawCast.map((m, i) => {
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
      biography: null, // loaded lazily in the modal
    };
  });
}
