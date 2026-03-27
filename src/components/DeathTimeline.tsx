"use client";
import { useState, useRef, useCallback } from "react";
import { CastMember, DeathDetails } from "@/types";
import { MapPin, ExternalLink, BookOpen } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  cast: CastMember[];
  releaseYear: number;
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

function sourceLabel(source: string | null) {
  if (source === "wikipedia") return "via Wikipedia";
  if (source === "findagrave") return "via Find a Grave";
  return null;
}

export default function DeathTimeline({ cast, releaseYear }: Props) {
  const [selectedMember, setSelectedMember] = useState<CastMember | null>(null);
  const [deathDetails, setDeathDetails] = useState<DeathDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [fetchedForId, setFetchedForId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const deceased = cast
    .filter((m) => m.deathday)
    .sort((a, b) => new Date(a.deathday!).getTime() - new Date(b.deathday!).getTime());

  const fetchDetails = useCallback((member: CastMember) => {
    if (fetchedForId === member.id && deathDetails) return; // already fetched
    setDetailsLoading(true);
    setDeathDetails(null);
    setFetchedForId(member.id);

    const birthYear = member.birthday ? new Date(member.birthday).getFullYear() : null;
    const deathYear = member.deathday ? new Date(member.deathday).getFullYear() : null;
    const params = new URLSearchParams({ name: member.name });
    if (birthYear) params.set("birthYear", String(birthYear));
    if (deathYear) params.set("deathYear", String(deathYear));

    fetch(`/api/deathdetails?${params}`)
      .then((r) => r.json())
      .then((d: DeathDetails) => setDeathDetails(d))
      .catch(() => setDeathDetails(null))
      .finally(() => setDetailsLoading(false));
  }, [fetchedForId, deathDetails]);

  function handleSelect(member: CastMember) {
    setSelectedMember(member);
    fetchDetails(member);
  }

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
              const isSelected = selectedMember?.id === member.id;
              return (
                <button
                  key={member.id}
                  className={`timeline-dot absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                    isSelected
                      ? "border-2 border-white ring-2 ring-gold-400/50"
                      : "border-2 border-[#0a0a0f]"
                  }`}
                  style={{
                    left: `${x}%`,
                    width: isSelected ? 18 : 14,
                    height: isSelected ? 18 : 14,
                    background: ageColor(member.age_at_death),
                    zIndex: isSelected ? 20 : undefined,
                  }}
                  onMouseEnter={() => setSelectedMember(member)}
                  onClick={() => handleSelect(member)}
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

      {/* Always-visible detail box */}
      <div className="mt-3 glass-card rounded-xl border border-white/10 min-h-[80px]">
        {selectedMember && selectedMember.deathday ? (
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                style={{ background: ageColor(selectedMember.age_at_death) }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white/90">{selectedMember.name}</div>
                <div className="text-sm text-white/50 italic mb-1">{selectedMember.character}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                  <span className="text-white/60">
                    Died: <span className="text-white/80">{formatDate(selectedMember.deathday)}</span>
                  </span>
                  {selectedMember.age_at_death !== null && (
                    <span className="text-white/60">
                      Age: <span className="text-white/80">{selectedMember.age_at_death}</span>
                    </span>
                  )}
                  {selectedMember.birthday && (
                    <span className="text-white/40">
                      Born: {formatDate(selectedMember.birthday)}
                    </span>
                  )}
                </div>

                {/* Death details section (fetched on click) */}
                {fetchedForId === selectedMember.id && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    {detailsLoading ? (
                      <div className="flex items-center gap-2 text-white/40 text-sm">
                        <LoadingSpinner size={14} />
                        Looking up death details…
                      </div>
                    ) : deathDetails ? (
                      <div className="space-y-2">
                        {deathDetails.cause_of_death && (
                          <div>
                            <span className="text-xs text-red-400/70 uppercase tracking-wider">
                              Cause of Death
                            </span>
                            {deathDetails.cause_source && (
                              <span className="text-[10px] text-white/25 ml-2">
                                {sourceLabel(deathDetails.cause_source)}
                              </span>
                            )}
                            <p className="text-sm text-white/80 mt-0.5 leading-relaxed">
                              {deathDetails.cause_of_death}
                            </p>
                          </div>
                        )}
                        {deathDetails.resting_place && (
                          <div className="flex items-start gap-2">
                            <MapPin size={12} className="text-gold-400 flex-shrink-0 mt-1" />
                            <div>
                              <span className="text-xs text-white/40 uppercase tracking-wider">
                                Resting Place
                              </span>
                              {deathDetails.resting_source && (
                                <span className="text-[10px] text-white/25 ml-2">
                                  {sourceLabel(deathDetails.resting_source)}
                                </span>
                              )}
                              <p className="text-sm text-white/80 mt-0.5">
                                {deathDetails.resting_place}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Source links */}
                        <div className="flex flex-wrap gap-3 pt-1">
                          {deathDetails.wikipedia_url && (
                            <a
                              href={deathDetails.wikipedia_url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="flex items-center gap-1.5 text-xs text-blue-400/70 hover:text-blue-300 transition-colors"
                            >
                              <BookOpen size={11} />
                              Wikipedia
                            </a>
                          )}
                          {deathDetails.memorial_url && (
                            <a
                              href={deathDetails.memorial_url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="flex items-center gap-1.5 text-xs text-gold-400/70 hover:text-gold-300 transition-colors"
                            >
                              <ExternalLink size={11} />
                              Find a Grave
                            </a>
                          )}
                        </div>
                        {!deathDetails.cause_of_death && !deathDetails.resting_place && (
                          <p className="text-xs text-white/25 italic">
                            No death details found on Wikipedia or Find a Grave.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-white/25 italic">
                        Could not retrieve death details.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 flex items-center justify-center min-h-[80px] text-white/25 text-sm">
            Hover over a timeline marker or click a name below to see details
          </div>
        )}
      </div>

      {/* Clickable name list */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {deceased.map((m) => {
          const isActive = selectedMember?.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleSelect(m)}
              className={`flex items-center gap-3 px-3 py-2 glass-card rounded-lg text-sm text-left transition-all w-full ${
                isActive
                  ? "border-gold-500/40 bg-gold-500/5 ring-1 ring-gold-500/30"
                  : "hover:bg-white/5"
              }`}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: ageColor(m.age_at_death) }}
              />
              <span
                className={`font-medium truncate ${
                  isActive ? "text-gold-400" : "text-white/80"
                }`}
              >
                {m.name}
              </span>
              <span className="text-white/30 text-xs flex-shrink-0 ml-auto">
                {m.deathday ? new Date(m.deathday + "T00:00:00").getFullYear() : ""}
                {m.age_at_death !== null ? ` · age ${m.age_at_death}` : ""}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
