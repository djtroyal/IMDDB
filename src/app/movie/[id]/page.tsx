import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, Calendar } from "lucide-react";
import { getMovieDetails, getCastWithDetails } from "@/lib/tmdb";
import { calculateStats } from "@/lib/statistics";
import Header from "@/components/Header";
import MoviePageClient from "@/components/MoviePageClient";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const movie = await getMovieDetails(parseInt(params.id, 10));
    return {
      title: `${movie.title} — IMDDB`,
      description: `Cast mortality statistics and death timeline for ${movie.title}`,
    };
  } catch {
    return { title: "Movie — IMDDB" };
  }
}

export default async function MoviePage({ params }: PageProps) {
  const movieId = parseInt(params.id, 10);
  if (isNaN(movieId)) notFound();

  let movie, cast;
  try {
    [movie, cast] = await Promise.all([
      getMovieDetails(movieId),
      getCastWithDetails(movieId),
    ]);
  } catch {
    notFound();
  }

  const stats = calculateStats(cast);
  const releaseYear = movie.release_date
    ? parseInt(movie.release_date.slice(0, 4), 10)
    : new Date().getFullYear();

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Movie hero with backdrop */}
      <section className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={backdropUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-20 blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/70 to-[#0a0a0f]" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to search
          </Link>

          <div className="flex gap-6 items-start">
            {/* Poster */}
            {posterUrl && (
              <div className="hidden sm:block w-32 md:w-44 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl relative aspect-[2/3]">
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-white/95 leading-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-white/50">
                {movie.release_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {releaseYear}
                  </div>
                )}
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star size={13} className="text-gold-400" />
                    {movie.vote_average.toFixed(1)}
                  </div>
                )}
                <div className="text-white/30">
                  {stats.deceased_count} of {stats.total_cast} cast deceased (
                  {stats.percent_deceased}%)
                </div>
              </div>

              {movie.overview && (
                <p className="mt-4 text-white/50 text-sm leading-relaxed max-w-2xl line-clamp-3">
                  {movie.overview}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pb-20 w-full space-y-12">
        <MoviePageClient stats={stats} cast={cast} releaseYear={releaseYear} />
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-white/25 text-xs">
        Data from{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="hover:text-gold-400 transition-colors">
          TMDB
        </a>{" "}
        and{" "}
        <a href="https://www.findagrave.com" target="_blank" rel="noreferrer" className="hover:text-gold-400 transition-colors">
          Find a Grave
        </a>
        . Not affiliated with IMDb.
      </footer>
    </div>
  );
}
