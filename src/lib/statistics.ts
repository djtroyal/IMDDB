import { CastMember, MovieStats } from "@/types";

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function calculateStats(cast: CastMember[]): MovieStats {
  const deceased = cast.filter((m) => m.deathday !== null);
  const living = cast.filter((m) => m.deathday === null && m.birthday !== null);

  const agesAtDeath = deceased
    .map((m) => m.age_at_death)
    .filter((a): a is number => a !== null);

  // Earliest and most recent death
  const withDeath = deceased
    .filter((m) => m.deathday)
    .sort((a, b) => new Date(a.deathday!).getTime() - new Date(b.deathday!).getTime());

  const earliest = withDeath[0] ?? null;
  const mostRecent = withDeath[withDeath.length - 1] ?? null;

  // Youngest and oldest at death
  const byAge = deceased
    .filter((m) => m.age_at_death !== null)
    .sort((a, b) => a.age_at_death! - b.age_at_death!);

  const youngest = byAge[0] ?? null;
  const oldest = byAge[byAge.length - 1] ?? null;

  // Oldest living (earliest birthday among living cast)
  const oldestLiving =
    living.length > 0
      ? living.sort(
          (a, b) => new Date(a.birthday!).getTime() - new Date(b.birthday!).getTime()
        )[0]
      : null;

  return {
    total_cast: cast.length,
    deceased_count: deceased.length,
    living_count: living.length,
    percent_deceased:
      cast.length > 0 ? Math.round((deceased.length / cast.length) * 100) : 0,
    median_age_at_death: median(agesAtDeath),
    mean_age_at_death: mean(agesAtDeath),
    earliest_death: earliest
      ? { member: earliest, date: earliest.deathday! }
      : null,
    most_recent_death: mostRecent
      ? { member: mostRecent, date: mostRecent.deathday! }
      : null,
    youngest_death: youngest
      ? { member: youngest, age: youngest.age_at_death! }
      : null,
    oldest_death: oldest ? { member: oldest, age: oldest.age_at_death! } : null,
    oldest_living: oldestLiving
      ? { member: oldestLiving, age: oldestLiving.current_age! }
      : null,
  };
}
