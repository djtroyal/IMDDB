import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types";
import { Star } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "Unknown";
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group glass-card rounded-xl overflow-hidden hover:border-gold-500/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/10 block"
    >
      <div className="relative aspect-[2/3] w-full bg-cinema-800 overflow-hidden">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
            No Poster
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Star size={10} className="text-gold-400 fill-gold-400" />
          <span className="text-xs text-white font-medium">
            {movie.vote_average.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight text-white/90 group-hover:text-gold-400 transition-colors line-clamp-2">
          {movie.title}
        </h3>
        <p className="text-white/40 text-xs mt-1">{year}</p>
      </div>
    </Link>
  );
}
