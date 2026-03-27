"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CastMember } from "@/types";

interface Props {
  cast: CastMember[];
}

const DECADES = [
  { label: "0–19", min: 0, max: 19 },
  { label: "20–29", min: 20, max: 29 },
  { label: "30–39", min: 30, max: 39 },
  { label: "40–49", min: 40, max: 49 },
  { label: "50–59", min: 50, max: 59 },
  { label: "60–69", min: 60, max: 69 },
  { label: "70–79", min: 70, max: 79 },
  { label: "80–89", min: 80, max: 89 },
  { label: "90+", min: 90, max: 999 },
];

export default function AgeDistributionChart({ cast }: Props) {
  const deceased = cast.filter((m) => m.age_at_death !== null);
  if (deceased.length === 0) return null;

  const data = DECADES.map((d) => ({
    label: d.label,
    count: deceased.filter(
      (m) => m.age_at_death! >= d.min && m.age_at_death! <= d.max
    ).length,
  })).filter((d) => d.count > 0);

  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
        Age at Death Distribution
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={24}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a25",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#e8e8f0",
              fontSize: 12,
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            formatter={(v) => [`${v} cast member${v !== 1 ? "s" : ""}`, "Deaths"]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell
                key={d.label}
                fill={d.count === max ? "#e6b800" : "rgba(230,184,0,0.35)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
