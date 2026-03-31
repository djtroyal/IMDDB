"use client";
import Link from "next/link";
import { Skull } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-cinema-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center group-hover:bg-gold-500/30 transition-colors">
            <Skull size={16} className="text-gold-400" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="gold-text">IMDDB</span>
          </span>
        </Link>
        <span className="text-white/30 text-sm hidden sm:block">
          Internet Movie Deadabase
        </span>
      </div>
    </header>
  );
}
