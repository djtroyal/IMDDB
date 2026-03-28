import { NextRequest, NextResponse } from "next/server";
import { getPersonBiography } from "@/lib/tmdb";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const personId = parseInt(params.id, 10);
  if (isNaN(personId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const biography = await getPersonBiography(personId);
  return NextResponse.json({ biography });
}
