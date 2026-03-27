"use client";
import Image from "next/image";
import { User } from "lucide-react";
import { CastMember } from "@/types";

interface Props {
  member: CastMember;
  onClick: () => void;
}

export default function CastMemberCard({ member, onClick }: Props) {
  const isDeceased = !!member.deathday;
  const photo = member.profile_path
    ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
    : null;

  return (
    <button
      onClick={onClick}
      className="group glass-card rounded-xl overflow-hidden text-left hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg w-full focus:outline-none focus:ring-2 focus:ring-gold-500/50"
    >
      <div className="relative aspect-[2/3] w-full bg-cinema-800 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 12vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={28} className="text-white/20" />
          </div>
        )}

        {/* Status overlay */}
        <div
          className={`absolute inset-0 ${
            isDeceased ? "deceased-overlay" : "living-overlay"
          }`}
        />

        {/* Status badge */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div
            className={`text-[9px] font-bold text-center rounded px-1 py-0.5 ${
              isDeceased
                ? "bg-red-900/80 text-red-200"
                : "bg-emerald-900/80 text-emerald-200"
            }`}
          >
            {isDeceased ? `✝ ${member.deathday ? new Date(member.deathday + "T00:00:00").getFullYear() : "DECEASED"}` : "LIVING"}
          </div>
        </div>
      </div>

      <div className="p-2.5">
        <div className="font-semibold text-xs text-white/90 leading-tight truncate">
          {member.name}
        </div>
        <div className="text-[10px] text-white/40 truncate italic mt-0.5">
          {member.character || "—"}
        </div>
        {isDeceased && member.age_at_death !== null && (
          <div className="text-[10px] text-red-400 mt-1">Age {member.age_at_death}</div>
        )}
        {!isDeceased && member.current_age !== null && (
          <div className="text-[10px] text-emerald-400 mt-1">Age {member.current_age}</div>
        )}
      </div>
    </button>
  );
}
