"use client";
import { useState, useEffect, useCallback } from "react";
import { CastMember, MovieStats } from "@/types";
import { calculateStats } from "@/lib/statistics";
import StatsPanel, { CastFilter } from "@/components/StatsPanel";
import DeathTimeline from "@/components/DeathTimeline";
import CastGrid from "@/components/CastGrid";
import CastDetailModal from "@/components/CastDetailModal";
import { Skull } from "lucide-react";

interface Props {
  movieId: number;
  totalCast: number;
  releaseYear: number;
}

export default function MoviePageClient({ movieId, totalCast, releaseYear }: Props) {
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [done, setDone] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CastMember | null>(null);
  const [ageFilter, setAgeFilter] = useState<{ min: number; max: number } | null>(null);
  const [castFilter, setCastFilter] = useState<CastFilter>("all");

  // Progressive batch loading
  const loadNextBatch = useCallback(async (batchIndex: number, accumulated: CastMember[]) => {
    try {
      const res = await fetch(`/api/cast/${movieId}?batch=${batchIndex}`);
      const data = await res.json();
      const updated = [...accumulated, ...data.cast];
      setCast(updated);
      setLoadedCount(updated.length);
      if (data.done) {
        setDone(true);
      } else {
        // Load next batch
        loadNextBatch(batchIndex + 1, updated);
      }
    } catch {
      setDone(true);
    }
  }, [movieId]);

  useEffect(() => {
    loadNextBatch(0, []);
  }, [loadNextBatch]);

  const stats: MovieStats | null = cast.length > 0 ? calculateStats(cast) : null;
  const progress = totalCast > 0 ? Math.round((loadedCount / totalCast) * 100) : 0;

  function handleSetCastFilter(filter: CastFilter) {
    setCastFilter(filter);
    setAgeFilter(null);
    document.getElementById("cast-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* Progress indicator */}
      {!done && (
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Skull size={16} className="text-gold-400 animate-pulse-slow" />
              <span className="text-white/50 text-sm">
                Loading cast details…
              </span>
            </div>
            <span className="text-white/40 text-sm font-mono">
              {loadedCount} / {totalCast}
            </span>
          </div>
          <div className="w-full h-1.5 bg-cinema-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500/70 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {stats && (
        <StatsPanel
          stats={stats}
          cast={cast}
          onSelectAgeRange={setAgeFilter}
          selectedAgeRange={ageFilter}
          onSelectMember={setSelectedMember}
          onSetCastFilter={handleSetCastFilter}
        />
      )}

      {cast.length > 0 && (
        <DeathTimeline
          cast={cast}
          releaseYear={releaseYear}
          onSelectMember={setSelectedMember}
        />
      )}

      {cast.length > 0 && (
        <CastGrid
          cast={cast}
          ageFilter={ageFilter}
          onClearAgeFilter={() => setAgeFilter(null)}
          onSelectMember={setSelectedMember}
          castFilter={castFilter}
          onSetCastFilter={setCastFilter}
        />
      )}

      {selectedMember && (
        <CastDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
}
