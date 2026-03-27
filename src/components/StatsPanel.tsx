import { MovieStats, CastMember } from "@/types";
import StatCard from "./StatCard";
import AgeDistributionChart from "./AgeDistributionChart";
import {
  Skull,
  Heart,
  TrendingUp,
  Clock,
  Calendar,
  Baby,
  User,
  Users,
  Activity,
} from "lucide-react";

export type CastFilter = "all" | "deceased" | "living";

interface Props {
  stats: MovieStats;
  cast: CastMember[];
  onSelectAgeRange: (range: { min: number; max: number } | null) => void;
  selectedAgeRange: { min: number; max: number } | null;
  onSelectMember: (member: CastMember) => void;
  onSetCastFilter: (filter: CastFilter) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function StatsPanel({
  stats,
  cast,
  onSelectAgeRange,
  selectedAgeRange,
  onSelectMember,
  onSetCastFilter,
}: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-white/80 flex items-center gap-2">
        <Activity size={18} className="text-gold-400" />
        Cast Statistics
      </h2>

      {/* Overview counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Cast"
          value={stats.total_cast}
          icon={<Users size={16} />}
          accent="blue"
          onClick={() => onSetCastFilter("all")}
        />
        <StatCard
          label="Deceased"
          value={stats.deceased_count}
          subtext={`${stats.percent_deceased}% of cast`}
          icon={<Skull size={16} />}
          accent="red"
          onClick={() => onSetCastFilter("deceased")}
        />
        <StatCard
          label="Living"
          value={stats.living_count}
          icon={<Heart size={16} />}
          accent="green"
          onClick={() => onSetCastFilter("living")}
        />
        <StatCard
          label="Mean Age at Death"
          value={stats.mean_age_at_death ? `${stats.mean_age_at_death} yrs` : null}
          subtext={stats.median_age_at_death ? `Median: ${stats.median_age_at_death} yrs` : undefined}
          icon={<TrendingUp size={16} />}
          accent="gold"
          onClick={() => onSetCastFilter("deceased")}
        />
      </div>

      {/* Detail stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          label="Earliest Death"
          value={stats.earliest_death ? formatDate(stats.earliest_death.date) : null}
          subtext={stats.earliest_death?.member.name}
          icon={<Clock size={16} />}
          accent="blue"
          onClick={stats.earliest_death ? () => onSelectMember(stats.earliest_death!.member) : undefined}
        />
        <StatCard
          label="Most Recent Death"
          value={stats.most_recent_death ? formatDate(stats.most_recent_death.date) : null}
          subtext={stats.most_recent_death?.member.name}
          icon={<Calendar size={16} />}
          accent="red"
          onClick={stats.most_recent_death ? () => onSelectMember(stats.most_recent_death!.member) : undefined}
        />
        <StatCard
          label="Youngest Death"
          value={stats.youngest_death ? `Age ${stats.youngest_death.age}` : null}
          subtext={stats.youngest_death?.member.name}
          icon={<Baby size={16} />}
          accent="red"
          onClick={stats.youngest_death ? () => onSelectMember(stats.youngest_death!.member) : undefined}
        />
        <StatCard
          label="Oldest Death"
          value={stats.oldest_death ? `Age ${stats.oldest_death.age}` : null}
          subtext={stats.oldest_death?.member.name}
          icon={<Skull size={16} />}
          accent="gold"
          onClick={stats.oldest_death ? () => onSelectMember(stats.oldest_death!.member) : undefined}
        />
        <StatCard
          label="Oldest Living"
          value={
            stats.oldest_living
              ? `Age ${stats.oldest_living.age}`
              : "Unknown"
          }
          subtext={stats.oldest_living?.member.name}
          icon={<User size={16} />}
          accent="green"
          onClick={stats.oldest_living ? () => onSelectMember(stats.oldest_living!.member) : undefined}
        />
        <StatCard
          label="Median Age at Death"
          value={stats.median_age_at_death ? `${stats.median_age_at_death} yrs` : null}
          icon={<TrendingUp size={16} />}
          accent="gold"
          onClick={() => onSetCastFilter("deceased")}
        />
      </div>

      {/* Age distribution chart */}
      <AgeDistributionChart
        cast={cast}
        onSelectAgeRange={onSelectAgeRange}
        selectedAgeRange={selectedAgeRange}
      />
    </section>
  );
}
