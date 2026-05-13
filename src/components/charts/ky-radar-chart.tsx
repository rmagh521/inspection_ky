"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface KYRadarChartProps {
  data: {
    technology: string;
    currentLevel: number;
    requiredLevel: number;
  }[];
}

export function KYRadarChart({ data }: KYRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid />
        <PolarAngleAxis dataKey="technology" tick={{ fontSize: 10 }} />
        <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
        <Radar
          name="현재 수준"
          dataKey="currentLevel"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
        />
        <Radar
          name="필요 수준"
          dataKey="requiredLevel"
          stroke="hsl(var(--chart-2))"
          fill="hsl(var(--chart-2))"
          fillOpacity={0.15}
        />
        <Legend
          verticalAlign="bottom"
          height={28}
          formatter={(value: string) => (
            <span className="text-xs">{value}</span>
          )}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}
