"use client";
import { useState, useRef } from "react";
import { CastMember } from "@/types";

interface Props {
  cast: CastMember[];
  releaseYear: number;
  onSelectMember: (member: CastMember) => void;
}

function ageColor(age: number | null): string {
  if (age === null) return "#94a3b8";
  if (age < 40) return "#ef4444";
  if (age < 60) return "#f97316";
  if (age < 75) return "#eab308";
  return "#22c55e";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function DeathTimeline({ cast, releaseYear, onSelectMember }: Props) {
  const [hoveredMember, setHoveredMember] = useState<CastMember | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const deceased = cast
    .filter((m) => m.deathday)
    .sort((a, b) => new Date(a.deathday!).getTime() - new Date(b.deathday!).getTime());

  if (deceased.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-bold text-white/80 mb-4">Death Timeline</h2>
        <div className="glass-card rounded-xl p-8 text-center text-white/30 text-sm">
          No deaths recorded for this cast.
        </div>
      </section>
    );
  }

  const firstYear = Math.min(
    releaseYear,
    new Date(deceased[0].deathday!).getFullYear()
  );
  const lastYear = Math.max(
    new Date().getFullYear(),
    new Date(deceased[deceased.length - 1].deathday!).getFullYear()
  );
  const span = lastYear - firstYear || 1;

  function xPercent(dateStr: string): number {
    const year = new Date(dateStr + "T00:00:00").getFullYear();
    const month = new Date(dateStr + "T00:00:00").getMonth();
    return Math.max(0, Math.min(100, ((year - firstYear + month / 12) / span) * 100));
  }

  const yearTicks: number[] = [];
  const tickStep = span <= 20 ? 5 : span <= 50 ? 10 : 20;
  for (let y = Math.ceil(firstYear / tickStep) * tickStep; y <= lastYear; y += tickStep) {
    yearTicks.push(y);
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-white/80 mb-1 flex items-center gap-2">
        <span>Death Timeline</span>
        <span className="text-sm font-normal text-white/30">
          {deceased.length} {deceased.length === 1 ? "death" : "deaths"}
        </span>
      </h2>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { color: "#ef4444", label: "Under 40" },
          { color: "#f97316", label: "40–59" },
          { color: "#eab308", label: "60–74" },
          { color: "#22c55e", label: "75+" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-white/40">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        className="glass-card rounded-xl p-5 overflow-x-auto select-none"
      >
        <div className="relative" style={{ minWidth: "400px" }}>
          {/* Timeline bar */}
          <div className="relative h-10 mb-2">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />

            {/* Release year marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${xPercent(`${releaseYear}-06-01`)}%` }}
            >
              <div className="w-2 h-6 bg-gold-500/60 rounded-sm" title={`Released ${releaseYear}`} />
            </div>

            {/* Death markers */}
            {deceased.map((member) => {
              const x = xPercent(member.deathday!);
              const isHovered = hoveredMember?.id === member.id;
              return (
                <button
                  key={member.id}
                  className={`timeline-dot absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                    isHovered
                      ? "border-2 border-white ring-2 ring-gold-400/50"
                      : "border-2 border-[#0a0a0f]"
                  }`}
                  style={{
                    left: `${x}%`,
                    width: isHovered ? 18 : 14,
                    height: isHovered ? 18 : 14,
                    background: ageColor(member.age_at_death),
                    zIndex: isHovered ? 20 : undefined,
                  }}
                  onMouseEnter={() => setHoveredMember(member)}
                  onClick={() => onSelectMember(member)}
                  aria-label={`${member.name} died ${formatDate(member.deathday!)}`}
                />
              );
            })}
          </div>

          {/* Year ticks */}
          <div className="relative h-5">
            {yearTicks.map((year) => {
              const x = ((year - firstYear) / span) * 100;
              return (
                <div
                  key={year}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${x}%` }}
                >
                  <div className="w-px h-2 bg-white/20 mx-auto" />
                  <div className="text-[10px] text-white/30 mt-0.5 text-center whitespace-nowrap">
                    {year}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Always-visible info box — shows hovered member basic info */}
      <div className="mt-3 glass-card rounded-xl border border-white/10 min-h-[56px]">
        {hoveredMember && hoveredMember.deathday ? (
          <div className="px-4 py-3 flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: ageColor(hoveredMember.age_at_death) }}
            />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-white/90">{hoveredMember.name}</span>
              <span className="text-white/40 italic text-sm ml-2">{hoveredMember.character}</span>
            </div>
            <div className="flex gap-4 text-sm text-white/50 flex-shrink-0">
              <span>{formatDate(hoveredMember.deathday)}</span>
              {hoveredMember.age_at_death !== null && (
                <span>age {hoveredMember.age_at_death}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 flex items-center justify-center min-h-[56px] text-white/25 text-sm">
            Hover over a marker or click a name to view details
          </div>
        )}
      </div>

      {/* Clickable name list */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {deceased.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectMember(m)}
            className="flex items-center gap-3 px-3 py-2 glass-card rounded-lg text-sm text-left transition-all w-full hover:bg-white/5 hover:border-gold-500/30"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: ageColor(m.age_at_death) }}
            />
            <span className="font-medium text-white/80 truncate">{m.name}</span>
            <span className="text-white/30 text-xs flex-shrink-0 ml-auto">
              {m.deathday ? new Date(m.deathday + "T00:00:00").getFullYear() : ""}
              {m.age_at_death !== null ? ` · age ${m.age_at_death}` : ""}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
