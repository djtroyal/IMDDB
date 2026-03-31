import { NextRequest, NextResponse } from "next/server";
import { getRawCast, enrichCastBatch } from "@/lib/tmdb";

const BATCH_SIZE = 20;

export async function GET(
  req: NextRequest,
  { params }: { params: { movieId: string } }
) {
  const movieId = parseInt(params.movieId, 10);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  const batchParam = req.nextUrl.searchParams.get("batch");
  const batchIndex = batchParam ? parseInt(batchParam, 10) : 0;

  const rawCast = await getRawCast(movieId);
  const totalBatches = Math.ceil(rawCast.length / BATCH_SIZE);

  if (batchIndex >= totalBatches) {
    return NextResponse.json({ cast: [], done: true, total: rawCast.length, totalBatches });
  }

  const slice = rawCast.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
  const enriched = await enrichCastBatch(slice);

  return NextResponse.json({
    cast: enriched,
    done: batchIndex + 1 >= totalBatches,
    total: rawCast.length,
    totalBatches,
    batch: batchIndex,
  });
}
