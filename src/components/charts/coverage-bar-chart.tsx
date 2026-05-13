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

interface CoverageBarChartProps {
  data: { product: string; inspectionPointCount: number; processStepCount: number }[];
  onBarClick?: (product: string) => void;
}

export function CoverageBarChart({ data, onBarClick }: CoverageBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 10, right: 20 }}
        onClick={(state) => {
          if (state?.activeLabel && onBarClick) {
            onBarClick(String(state.activeLabel));
          }
        }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="product"
          width={80}
          tick={{ fontSize: 11 }}
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
          dataKey="inspectionPointCount"
          name="검사포인트"
          fill="hsl(var(--primary))"
          radius={[0, 4, 4, 0]}
          barSize={10}
          cursor={onBarClick ? "pointer" : undefined}
        />
        <Bar
          dataKey="processStepCount"
          name="공정단계"
          fill="hsl(var(--chart-2))"
          radius={[0, 4, 4, 0]}
          barSize={10}
          cursor={onBarClick ? "pointer" : undefined}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
