import Header from "@/components/Header";
import { Skull } from "lucide-react";

export default function MovieLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero skeleton */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-10">
          <div className="skeleton h-4 w-24 rounded mb-6" />

          <div className="flex gap-6 items-start">
            {/* Poster skeleton */}
            <div className="hidden sm:block w-32 md:w-44 flex-shrink-0 rounded-xl overflow-hidden aspect-[2/3] skeleton" />

            {/* Info skeleton */}
            <div className="flex-1 space-y-3">
              <div className="skeleton h-8 w-64 rounded" />
              <div className="skeleton h-4 w-48 rounded" />
              <div className="skeleton h-4 w-full max-w-md rounded" />
              <div className="skeleton h-4 w-full max-w-lg rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pb-20 w-full space-y-12">
        {/* Loading banner */}
        <div className="glass-card rounded-xl p-6 text-center animate-pulse-slow">
          <div className="flex items-center justify-center gap-3">
            <Skull size={18} className="text-gold-400" />
            <span className="text-white/50 text-sm">
              Loading cast data from TMDB…
            </span>
          </div>
          <div className="mt-3 w-48 mx-auto h-1 bg-cinema-700 rounded-full overflow-hidden">
            <div className="h-full bg-gold-500/60 rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: "60%" }} />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="space-y-4">
          <div className="skeleton h-5 w-40 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton rounded-xl h-28" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton rounded-xl h-28" />
            ))}
          </div>
        </div>

        {/* Timeline skeleton */}
        <div className="space-y-4">
          <div className="skeleton h-5 w-36 rounded" />
          <div className="skeleton rounded-xl h-24" />
        </div>

        {/* Cast grid skeleton */}
        <div className="space-y-4">
          <div className="skeleton h-5 w-36 rounded" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="skeleton rounded-xl aspect-[2/3]" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
