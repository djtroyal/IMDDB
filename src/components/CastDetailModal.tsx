"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { X, MapPin, ExternalLink, User } from "lucide-react";
import { CastMember, FindAGraveResult } from "@/types";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  member: CastMember;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function CastDetailModal({ member, onClose }: Props) {
  const [graveData, setGraveData] = useState<FindAGraveResult | null>(null);
  const [graveLoading, setGraveLoading] = useState(false);

  useEffect(() => {
    if (!member.deathday) return;
    setGraveLoading(true);
    const birthYear = member.birthday ? new Date(member.birthday).getFullYear() : null;
    const deathYear = new Date(member.deathday).getFullYear();
    const params = new URLSearchParams({ name: member.name });
    if (birthYear) params.set("birthYear", String(birthYear));
    params.set("deathYear", String(deathYear));

    fetch(`/api/findagrave?${params}`)
      .then((r) => r.json())
      .then((d: FindAGraveResult) => setGraveData(d))
      .catch(() => setGraveData(null))
      .finally(() => setGraveLoading(false));
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
          {/* Biography */}
          {member.biography && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                Biography
              </h3>
              <p className="text-sm text-white/60 leading-relaxed line-clamp-4">
                {member.biography}
              </p>
            </div>
          )}

          {/* Find a Grave section (deceased only) */}
          {isDeceased && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Find a Grave
              </h3>

              {graveLoading ? (
                <div className="flex items-center gap-3 text-white/40 text-sm">
                  <LoadingSpinner size={16} />
                  Searching Find a Grave…
                </div>
              ) : graveData ? (
                <div className="space-y-3">
                  {graveData.cause_of_death && (
                    <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4">
                      <div className="text-xs text-red-400/70 uppercase tracking-wider mb-1.5">
                        Cause of Death
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {graveData.cause_of_death}
                      </p>
                    </div>
                  )}

                  {graveData.resting_place && (
                    <div className="bg-cinema-800 rounded-xl p-4 flex items-start gap-3">
                      <MapPin size={14} className="text-gold-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
                          Final Resting Place
                        </div>
                        <p className="text-sm text-white/80">{graveData.resting_place}</p>
                      </div>
                    </div>
                  )}

                  {graveData.memorial_url && (
                    <a
                      href={graveData.memorial_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      <ExternalLink size={13} />
                      View on Find a Grave
                    </a>
                  )}

                  {!graveData.cause_of_death && !graveData.resting_place && !graveData.memorial_url && (
                    <div className="text-sm text-white/30 italic">
                      No memorial found on Find a Grave.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-white/30 italic">
                  Could not retrieve Find a Grave data.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
