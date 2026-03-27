"use client";
import { useState } from "react";
import { CastMember, MovieStats } from "@/types";
import StatsPanel, { CastFilter } from "@/components/StatsPanel";
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
  const [castFilter, setCastFilter] = useState<CastFilter>("all");

  function handleSetCastFilter(filter: CastFilter) {
    setCastFilter(filter);
    setAgeFilter(null);
    // Scroll to the cast grid
    document.getElementById("cast-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <StatsPanel
        stats={stats}
        cast={cast}
        onSelectAgeRange={setAgeFilter}
        selectedAgeRange={ageFilter}
        onSelectMember={setSelectedMember}
        onSetCastFilter={handleSetCastFilter}
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
        castFilter={castFilter}
        onSetCastFilter={setCastFilter}
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
