interface StatCardProps {
  label: string;
  value: string | number | null;
  subtext?: string;
  icon: React.ReactNode;
  accent?: "gold" | "red" | "green" | "blue";
}

const accentMap = {
  gold: "bg-gold-500/10 border-gold-500/20",
  red: "bg-red-500/10 border-red-500/20",
  green: "bg-emerald-500/10 border-emerald-500/20",
  blue: "bg-blue-500/10 border-blue-500/20",
};

const iconAccentMap = {
  gold: "text-gold-400",
  red: "text-red-400",
  green: "text-emerald-400",
  blue: "text-blue-400",
};

export default function StatCard({
  label,
  value,
  subtext,
  icon,
  accent = "gold",
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-3 animate-slide-up ${accentMap[accent]}`}
    >
      <div className={`w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center ${iconAccentMap[accent]}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{label}</div>
        <div className="text-xl font-bold text-white/90 leading-tight">
          {value ?? "—"}
        </div>
        {subtext && (
          <div className="text-xs text-white/40 mt-1 line-clamp-1">{subtext}</div>
        )}
      </div>
    </div>
  );
}
