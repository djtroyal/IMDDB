import { NextRequest, NextResponse } from "next/server";
import { searchWikipedia } from "@/lib/wikipedia";
import { searchFindAGrave } from "@/lib/findagrave";
import { DeathDetails } from "@/types";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  const birthYear = req.nextUrl.searchParams.get("birthYear");
  const deathYear = req.nextUrl.searchParams.get("deathYear");

  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const bYear = birthYear ? parseInt(birthYear, 10) : null;
  const dYear = deathYear ? parseInt(deathYear, 10) : null;

  try {
    // Fetch both sources in parallel
    const [wiki, grave] = await Promise.all([
      searchWikipedia(name),
      searchFindAGrave(name, bYear, dYear),
    ]);

    // Merge: Wikipedia is primary, Find a Grave is backup
    const result: DeathDetails = {
      cause_of_death: wiki.cause_of_death ?? grave.cause_of_death ?? null,
      resting_place: wiki.resting_place ?? grave.resting_place ?? null,
      cause_source: wiki.cause_of_death
        ? "wikipedia"
        : grave.cause_of_death
          ? "findagrave"
          : null,
      resting_source: wiki.resting_place
        ? "wikipedia"
        : grave.resting_place
          ? "findagrave"
          : null,
      bio: grave.bio ?? null,
      memorial_url: grave.memorial_url ?? null,
      wikipedia_url: wiki.wikipedia_url ?? null,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Death details error:", err);
    return NextResponse.json(
      {
        cause_of_death: null,
        resting_place: null,
        cause_source: null,
        resting_source: null,
        bio: null,
        memorial_url: null,
        wikipedia_url: null,
        error: "Lookup failed",
      } satisfies DeathDetails & { error: string },
      { status: 200 }
    );
  }
}
