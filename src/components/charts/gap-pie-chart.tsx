"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const GAP_COLORS: Record<string, string> = {
  NONE: "#22c55e",
  SMALL: "#eab308",
  MEDIUM: "#f97316",
  LARGE: "#ef4444",
};

const GAP_LABELS: Record<string, string> = {
  NONE: "Gap 없음",
  SMALL: "소규모 Gap",
  MEDIUM: "중규모 Gap",
  LARGE: "대규모 Gap",
};

interface GapPieChartProps {
  data: { level: string; count: number }[];
  onSliceClick?: (level: string) => void;
}

export function GapPieChart({ data, onSliceClick }: GapPieChartProps) {
  const chartData = data.map((d) => ({
    name: GAP_LABELS[d.level] ?? d.level,
    value: d.count,
    fill: GAP_COLORS[d.level] ?? "#94a3b8",
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
          cursor={onSliceClick ? "pointer" : undefined}
          onClick={(_entry, index) => {
            if (onSliceClick && data[index]) {
              onSliceClick(data[index].level);
            }
          }}
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => (
            <span className="text-xs">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
