import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { Skull, TrendingUp, Clock, MapPin } from "lucide-react";

const FEATURED = [
  { title: "The Wizard of Oz", id: 630 },
  { title: "Casablanca", id: 492 },
  { title: "Gone with the Wind", id: 770 },
  { title: "Apocalypse Now", id: 11252 },
  { title: "The Godfather", id: 238 },
  { title: "Psycho", id: 539 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="relative overflow-hidden">
          {/* Radial glow background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/5 blur-3xl rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center relative">
            <div className="inline-flex items-center gap-2 bg-cinema-800 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/50 mb-8">
              <Skull size={12} className="text-gold-400" />
              <span>On-screen cast · TMDB · Find a Grave</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="gold-text">IMDDB</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/60 mb-3 font-light">
              Internet Movie Death Database
            </p>
            <p className="text-white/40 max-w-lg mx-auto mb-12 text-sm">
              Search any movie to explore cast mortality statistics, interactive death timelines,
              causes of death, and final resting places.
            </p>

            <SearchBar />

            {/* Quick-pick featured movies */}
            <div className="mt-8">
              <p className="text-white/30 text-xs mb-3 uppercase tracking-widest">
                Try a classic
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {FEATURED.map((f) => (
                  <a
                    key={f.id}
                    href={`/movie/${f.id}`}
                    className="px-3 py-1.5 text-xs rounded-full bg-cinema-800 border border-white/10 text-white/50 hover:border-gold-500/50 hover:text-gold-400 transition-all"
                  >
                    {f.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <TrendingUp size={20} className="text-gold-400" />,
                title: "Death Statistics",
                desc: "Median & mean age at death, youngest, oldest, first and most recent.",
              },
              {
                icon: <Clock size={20} className="text-gold-400" />,
                title: "Visual Timeline",
                desc: "Interactive chronological timeline of cast member deaths.",
              },
              {
                icon: <MapPin size={20} className="text-gold-400" />,
                title: "Find a Grave",
                desc: "Cause of death and final resting place sourced from Find a Grave.",
              },
            ].map((f) => (
              <div key={f.title} className="glass-card rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white/90 mb-1">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
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
