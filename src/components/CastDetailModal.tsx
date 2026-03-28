"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { X, MapPin, ExternalLink, BookOpen, User } from "lucide-react";
import { CastMember, DeathDetails } from "@/types";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  member: CastMember;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function sourceLabel(source: string | null) {
  if (source === "wikipedia") return "via Wikipedia";
  if (source === "findagrave") return "via Find a Grave";
  return null;
}

export default function CastDetailModal({ member, onClose }: Props) {
  const [details, setDetails] = useState<DeathDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [biography, setBiography] = useState<string | null>(member.biography);

  // Fetch death details for deceased members
  useEffect(() => {
    if (!member.deathday) return;
    setLoading(true);
    const birthYear = member.birthday ? new Date(member.birthday).getFullYear() : null;
    const deathYear = new Date(member.deathday).getFullYear();
    const params = new URLSearchParams({ name: member.name });
    if (birthYear) params.set("birthYear", String(birthYear));
    params.set("deathYear", String(deathYear));

    fetch(`/api/deathdetails?${params}`)
      .then((r) => r.json())
      .then((d: DeathDetails) => setDetails(d))
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
  }, [member]);

  // Lazy-load biography from TMDB if not already present
  useEffect(() => {
    if (member.biography) { setBiography(member.biography); return; }
    fetch(`/api/person/${member.id}`)
      .then((r) => r.json())
      .then((d) => setBiography(d.biography ?? null))
      .catch(() => {});
  }, [member]);

  const photo = member.profile_path
    ? `https://image.tmdb.org/t/p/w342${member.profile_path}`
    : null;

  const isDeceased = !!member.deathday;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={14} />
        </button>

        {/* Header with photo */}
        <div className="flex gap-4 p-5 pb-4 border-b border-white/10">
          <div className="w-20 h-28 rounded-xl overflow-hidden bg-cinema-700 flex-shrink-0 relative">
            {photo ? (
              <Image
                src={photo}
                alt={member.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={24} className="text-white/20" />
              </div>
            )}
            {/* Status badge */}
            <div
              className={`absolute bottom-1 left-1 right-1 text-center text-[9px] font-bold rounded px-1 py-0.5 ${
                isDeceased
                  ? "bg-red-900/80 text-red-300"
                  : "bg-emerald-900/80 text-emerald-300"
              }`}
            >
              {isDeceased ? "DECEASED" : "LIVING"}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-xl text-white/90 leading-tight">{member.name}</h2>
            <p className="text-white/50 italic text-sm mt-0.5">{member.character}</p>
            <div className="mt-3 space-y-1">
              {member.birthday && (
                <div className="text-sm text-white/60">
                  <span className="text-white/30">Born </span>
                  {formatDate(member.birthday)}
                </div>
              )}
              {member.deathday && (
                <div className="text-sm text-white/60">
                  <span className="text-white/30">Died </span>
                  {formatDate(member.deathday)}
                </div>
              )}
              {member.age_at_death !== null && (
                <div className="text-sm font-medium text-red-400">
                  Age at death: {member.age_at_death}
                </div>
              )}
              {member.current_age !== null && (
                <div className="text-sm font-medium text-emerald-400">
                  Current age: {member.current_age}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Biography from TMDB (lazy-loaded) */}
          {biography && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                Biography
              </h3>
              <p className="text-sm text-white/60 leading-relaxed line-clamp-4">
                {biography}
              </p>
            </div>
          )}

          {/* Death details section (deceased only) */}
          {isDeceased && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Death Details
              </h3>

              {loading ? (
                <div className="flex items-center gap-3 text-white/40 text-sm">
                  <LoadingSpinner size={16} />
                  Searching Wikipedia &amp; Find a Grave…
                </div>
              ) : details ? (
                <div className="space-y-3">
                  {details.cause_of_death && (
                    <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-red-400/70 uppercase tracking-wider">
                          Cause of Death
                        </span>
                        {details.cause_source && (
                          <span className="text-[10px] text-white/25 bg-white/5 rounded px-1.5 py-0.5">
                            {sourceLabel(details.cause_source)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {details.cause_of_death}
                      </p>
                    </div>
                  )}

                  {details.resting_place && (
                    <div className="bg-cinema-800 rounded-xl p-4 flex items-start gap-3">
                      <MapPin size={14} className="text-gold-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white/40 uppercase tracking-wider">
                            Final Resting Place
                          </span>
                          {details.resting_source && (
                            <span className="text-[10px] text-white/25 bg-white/5 rounded px-1.5 py-0.5">
                              {sourceLabel(details.resting_source)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/80">{details.resting_place}</p>
                      </div>
                    </div>
                  )}

                  {/* Find a Grave bio (supplementary to TMDB biography) */}
                  {details.bio && (
                    <div>
                      <h4 className="text-xs text-white/30 uppercase tracking-wider mb-1.5">
                        Find a Grave Bio
                      </h4>
                      <p className="text-sm text-white/50 leading-relaxed line-clamp-4">
                        {details.bio}
                      </p>
                    </div>
                  )}

                  {/* Source links */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {details.wikipedia_url && (
                      <a
                        href={details.wikipedia_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <BookOpen size={13} />
                        View on Wikipedia
                      </a>
                    )}
                    {details.memorial_url && (
                      <a
                        href={details.memorial_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
                      >
                        <ExternalLink size={13} />
                        View on Find a Grave
                      </a>
                    )}
                  </div>

                  {!details.cause_of_death && !details.resting_place && !details.memorial_url && !details.wikipedia_url && (
                    <div className="text-sm text-white/30 italic">
                      No details found on Wikipedia or Find a Grave.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-white/30 italic">
                  Could not retrieve death details.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
