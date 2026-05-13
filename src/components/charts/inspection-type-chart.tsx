"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface InspectionTypeChartProps {
  data: { type: string; label: string; count: number }[];
  onBarClick?: (type: string) => void;
}

export function InspectionTypeChart({ data, onBarClick }: InspectionTypeChartProps) {
  const chartData = data.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10 }}
          angle={-35}
          textAnchor="end"
          height={60}
        />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar
          dataKey="count"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          barSize={24}
          cursor={onBarClick ? "pointer" : undefined}
          onClick={(_entry, index) => {
            if (onBarClick && chartData[index]) {
              onBarClick(chartData[index].type);
            }
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
