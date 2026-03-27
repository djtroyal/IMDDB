"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Film } from "lucide-react";
import { Movie } from "@/types";
import LoadingSpinner from "./LoadingSpinner";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(movie: Movie) {
    setOpen(false);
    setQuery("");
    router.push(`/movie/${movie.id}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-4 text-white/40 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
          className="w-full bg-cinema-800 border border-white/10 rounded-xl pl-11 pr-10 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-gold-500/60 focus:bg-cinema-700 transition-all text-base"
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading ? (
          <div className="absolute right-4">
            <LoadingSpinner size={16} />
          </div>
        ) : query ? (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
            className="absolute right-4 text-white/30 hover:text-white/70 transition-colors"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full glass-card rounded-xl overflow-hidden shadow-2xl z-50 max-h-96 overflow-y-auto border border-white/10">
          {results.map((movie) => {
            const year = movie.release_date?.slice(0, 4);
            const poster = movie.poster_path
              ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
              : null;
            return (
              <button
                key={movie.id}
                onClick={() => handleSelect(movie)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
              >
                <div className="w-9 h-14 rounded overflow-hidden bg-cinema-700 flex-shrink-0 relative">
                  {poster ? (
                    <Image src={poster} alt={movie.title} fill sizes="36px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={14} className="text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white/90 truncate">{movie.title}</div>
                  {year && <div className="text-xs text-white/40 mt-0.5">{year}</div>}
                  {movie.overview && (
                    <div className="text-xs text-white/30 mt-1 line-clamp-1">{movie.overview}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && !loading && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute top-full mt-2 w-full glass-card rounded-xl px-4 py-6 text-center text-white/40 text-sm z-50 border border-white/10">
          No movies found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
