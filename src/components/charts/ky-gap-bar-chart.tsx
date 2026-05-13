"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface KYGapBarChartProps {
  data: {
    technology: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
  }[];
}

export function KYGapBarChart({ data }: KYGapBarChartProps) {
  const sorted = [...data].sort((a, b) => b.gap - a.gap);

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, sorted.length * 30)}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 5]} />
        <YAxis
          type="category"
          dataKey="technology"
          width={120}
          tick={{ fontSize: 10 }}
        />
        <Tooltip />
        <Legend
          verticalAlign="top"
          height={28}
          formatter={(value: string) => (
            <span className="text-xs">{value}</span>
          )}
        />
        <Bar
          dataKey="currentLevel"
          name="현재 수준"
          fill="hsl(var(--primary))"
          radius={[0, 4, 4, 0]}
          barSize={10}
        />
        <Bar
          dataKey="requiredLevel"
          name="필요 수준"
          fill="hsl(var(--chart-2))"
          radius={[0, 4, 4, 0]}
          barSize={10}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
