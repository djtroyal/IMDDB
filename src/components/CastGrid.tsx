"use client";
import { CastMember } from "@/types";
import CastMemberCard from "./CastMemberCard";
import { Users, Skull, Heart, X } from "lucide-react";
import type { CastFilter } from "./StatsPanel";

interface Props {
  cast: CastMember[];
  ageFilter: { min: number; max: number } | null;
  onClearAgeFilter: () => void;
  onSelectMember: (member: CastMember) => void;
  castFilter: CastFilter;
  onSetCastFilter: (filter: CastFilter) => void;
}

export default function CastGrid({ cast, ageFilter, onClearAgeFilter, onSelectMember, castFilter, onSetCastFilter }: Props) {
  const deceased = cast.filter((m) => m.deathday);
  const living = cast.filter((m) => !m.deathday);

  let visible =
    castFilter === "all" ? cast : castFilter === "deceased" ? deceased : living;

  // Apply age-at-death filter from histogram
  if (ageFilter) {
    visible = visible.filter(
      (m) =>
        m.age_at_death !== null &&
        m.age_at_death >= ageFilter.min &&
        m.age_at_death <= ageFilter.max
    );
  }

  const filters: { id: CastFilter; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "all", label: "All", icon: <Users size={13} />, count: cast.length },
    { id: "deceased", label: "Deceased", icon: <Skull size={13} />, count: deceased.length },
    { id: "living", label: "Living", icon: <Heart size={13} />, count: living.length },
  ];

  return (
    <section id="cast-grid">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white/80 flex items-center gap-2">
          <Users size={18} className="text-gold-400" />
          On-Screen Cast
        </h2>

        <div className="flex items-center gap-2">
          {/* Age filter badge */}
          {ageFilter && (
            <button
              onClick={onClearAgeFilter}
              className="flex items-center gap-1.5 text-xs text-gold-400 bg-gold-500/10 border border-gold-500/30 rounded-full px-3 py-1.5 hover:bg-gold-500/20 transition-colors"
            >
              Age {ageFilter.min}–{ageFilter.max === 999 ? "90+" : ageFilter.max}
              <X size={11} />
            </button>
          )}

          {/* Filter tabs */}
          <div className="flex gap-1 bg-cinema-800 rounded-lg p-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => onSetCastFilter(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  castFilter === f.id
                    ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {f.icon}
                {f.label}
                <span className="text-[10px] opacity-60">{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {visible.map((member) => (
          <CastMemberCard
            key={member.id}
            member={member}
            onClick={() => onSelectMember(member)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center text-white/30 text-sm">
          {ageFilter
            ? "No cast members died in this age range."
            : "No cast members in this category."}
        </div>
      )}
    </section>
  );
}
