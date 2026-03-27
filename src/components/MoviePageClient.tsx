"use client";
import { useState } from "react";
import { CastMember, MovieStats } from "@/types";
import StatsPanel from "@/components/StatsPanel";
import DeathTimeline from "@/components/DeathTimeline";
import CastGrid from "@/components/CastGrid";
import CastDetailModal from "@/components/CastDetailModal";

interface Props {
  stats: MovieStats;
  cast: CastMember[];
  releaseYear: number;
}

export default function MoviePageClient({ stats, cast, releaseYear }: Props) {
  const [selectedMember, setSelectedMember] = useState<CastMember | null>(null);
  const [ageFilter, setAgeFilter] = useState<{ min: number; max: number } | null>(null);

  return (
    <>
      <StatsPanel
        stats={stats}
        cast={cast}
        onSelectAgeRange={setAgeFilter}
        selectedAgeRange={ageFilter}
      />
      <DeathTimeline
        cast={cast}
        releaseYear={releaseYear}
        onSelectMember={setSelectedMember}
      />
      <CastGrid
        cast={cast}
        ageFilter={ageFilter}
        onClearAgeFilter={() => setAgeFilter(null)}
        onSelectMember={setSelectedMember}
      />

      {selectedMember && (
        <CastDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
}
