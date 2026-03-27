import { NextRequest, NextResponse } from "next/server";
import { searchFindAGrave } from "@/lib/findagrave";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  const birthYear = req.nextUrl.searchParams.get("birthYear");
  const deathYear = req.nextUrl.searchParams.get("deathYear");

  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  try {
    const result = await searchFindAGrave(
      name,
      birthYear ? parseInt(birthYear, 10) : null,
      deathYear ? parseInt(deathYear, 10) : null
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("FindAGrave error:", err);
    return NextResponse.json(
      { cause_of_death: null, resting_place: null, memorial_url: null, error: "Scrape failed" },
      { status: 200 }
    );
  }
}
