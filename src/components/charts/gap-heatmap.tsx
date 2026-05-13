"use client";

import { cn } from "@/lib/utils";

interface GapHeatmapData {
  name: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  gapLevel: string;
}

const GAP_BG: Record<string, string> = {
  NONE: "bg-green-100 dark:bg-green-900/40",
  SMALL: "bg-yellow-100 dark:bg-yellow-900/40",
  MEDIUM: "bg-orange-100 dark:bg-orange-900/40",
  LARGE: "bg-red-100 dark:bg-red-900/40",
};

const CATEGORY_LABELS: Record<string, string> = {
  OPTICAL_SENSOR: "광학/센서",
  SOFTWARE_ALGORITHM: "SW/알고리즘",
  HARDWARE_MECHANICS: "HW/메카닉스",
};

export function GapHeatmap({ data }: { data: GapHeatmapData[] }) {
  const categories = [...new Set(data.map((d) => d.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">Gap 수준:</span>
        {Object.entries(GAP_BG).map(([level, bg]) => (
          <span key={level} className={cn("rounded px-2 py-0.5", bg)}>
            {level}
          </span>
        ))}
      </div>

      {categories.map((cat) => {
        const items = data.filter((d) => d.category === cat);
        return (
          <div key={cat}>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
              {CATEGORY_LABELS[cat] ?? cat}
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {items.map((item) => (
                <div
                  key={item.name}
                  className={cn(
                    "rounded-md p-2 text-center",
                    GAP_BG[item.gapLevel] ?? "bg-gray-100"
                  )}
                >
                  <div className="text-xs font-medium leading-tight truncate">
                    {item.name}
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {item.currentLevel} → {item.requiredLevel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
