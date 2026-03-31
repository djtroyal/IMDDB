import { NextRequest, NextResponse } from "next/server";
import { getMovieDetails, getRawCast } from "@/lib/tmdb";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const movieId = parseInt(params.id, 10);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }
  try {
    const [movie, rawCast] = await Promise.all([
      getMovieDetails(movieId),
      getRawCast(movieId),
    ]);
    return NextResponse.json({ movie, castCount: rawCast.length });
  } catch (err) {
    console.error("Movie fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch movie data" }, { status: 500 });
  }
}
