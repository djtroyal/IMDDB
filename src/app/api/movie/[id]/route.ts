import { NextRequest, NextResponse } from "next/server";
import { getMovieDetails, getCastWithDetails } from "@/lib/tmdb";
import { calculateStats } from "@/lib/statistics";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const movieId = parseInt(params.id, 10);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }
  try {
    const [movie, cast] = await Promise.all([
      getMovieDetails(movieId),
      getCastWithDetails(movieId),
    ]);
    const stats = calculateStats(cast);
    return NextResponse.json({ movie, cast, stats });
  } catch (err) {
    console.error("Movie fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch movie data" }, { status: 500 });
  }
}
