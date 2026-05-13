"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar, type FilterConfig } from "@/components/filters/filter-bar";
import { useFilterParams } from "@/hooks/use-filter-params";
import { gapLevelToColor, inspectionTypeLabel } from "@/lib/utils";
import { KYRadarChart } from "@/components/charts/ky-radar-chart";
import { KYGapBarChart } from "@/components/charts/ky-gap-bar-chart";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { KYProduct, KYCapability } from "@/types/data";

interface KYAnalysisClientProps {
  kyProducts: KYProduct[];
  capabilities: KYCapability[];
}

export function KYAnalysisClient({ kyProducts, capabilities }: KYAnalysisClientProps) {
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useFilterParams<Record<string, string>>({ status: "", gapLevel: "" });

  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const gapLevels = useMemo(
    () => [...new Set(capabilities.map((c) => c.gapLevel))].sort(),
    [capabilities]
  );

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        key: "status",
        label: "제품 상태",
        options: ["current", "development"],
        labelMap: { current: "현재 제품", development: "개발 중" } as Record<string, string>,
      },
      {
        key: "gapLevel",
        label: "Gap 수준",
        options: gapLevels,
        labelMap: { NONE: "없음", SMALL: "소규모", MEDIUM: "중규모", LARGE: "대규모" } as Record<string, string>,
      },
    ],
    [gapLevels]
  );

  const filteredProducts = useMemo(() => {
    let result = kyProducts;
    if (filters.status === "current") result = result.filter((p) => p.isCurrentProduct);
    if (filters.status === "development") result = result.filter((p) => !p.isCurrentProduct);
    return result;
  }, [kyProducts, filters.status]);

  const filteredCaps = useMemo(() => {
    if (!filters.gapLevel) return capabilities;
    return capabilities.filter((c) => c.gapLevel === filters.gapLevel);
  }, [capabilities, filters.gapLevel]);

  const gapOrder: Record<string, number> = { LARGE: 0, MEDIUM: 1, SMALL: 2, NONE: 3 };
  const sortedCaps = useMemo(
    () => [...filteredCaps].sort((a, b) => (gapOrder[a.gapLevel] ?? 9) - (gapOrder[b.gapLevel] ?? 9)),
    [filteredCaps]
  );

  const radarData = useMemo(
    () =>
      filteredCaps.map((c) => ({
        technology: c.technologyName,
        currentLevel: c.currentLevel,
        requiredLevel: c.requiredLevel,
      })),
    [filteredCaps]
  );

  const gapBarData = useMemo(
    () =>
      filteredCaps.map((c) => ({
        technology: c.technologyName,
        currentLevel: c.currentLevel,
        requiredLevel: c.requiredLevel,
        gap: c.requiredLevel - c.currentLevel,
      })),
    [filteredCaps]
  );

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filterConfigs}
        values={filters}
        onChange={setFilter}
        onClear={clearFilters}
        hasActive={hasActiveFilters}
      />

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">KY 제품</TabsTrigger>
          <TabsTrigger value="capabilities">기술 역량</TabsTrigger>
          <TabsTrigger value="visualization">시각화</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{product.name}</CardTitle>
                    <Badge variant={product.isCurrentProduct ? "default" : "secondary"}>
                      {product.isCurrentProduct ? "현재 제품" : "개발 중"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.series && (
                    <p className="text-xs text-muted-foreground mb-1">
                      시리즈: {product.series}
                    </p>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {product.primaryInspectionType
                      ? inspectionTypeLabel(product.primaryInspectionType)
                      : "-"}
                  </Badge>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="capabilities" className="mt-4">
          <div className="space-y-3">
            {sortedCaps.map((cap) => (
              <Card key={cap.technologyName}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{cap.technologyName}</span>
                        <Badge className={gapLevelToColor(cap.gapLevel)} variant="secondary">
                          {cap.gapLevel}
                        </Badge>
                      </div>
                      {cap.gapDescription && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {cap.gapDescription}
                        </p>
                      )}
                      {cap.improvementPlan && (
                        <div className="mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              setExpandedPlan(
                                expandedPlan === cap.technologyName ? null : cap.technologyName
                              )
                            }
                          >
                            개선계획
                            {expandedPlan === cap.technologyName ? (
                              <ChevronUp className="ml-1 h-3 w-3" />
                            ) : (
                              <ChevronDown className="ml-1 h-3 w-3" />
                            )}
                          </Button>
                          {expandedPlan === cap.technologyName && (
                            <p className="text-xs text-muted-foreground mt-1 pl-2 border-l-2 border-primary/20">
                              {cap.improvementPlan}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-6 shrink-0 ml-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">{cap.currentLevel}</div>
                        <div className="text-[10px] text-muted-foreground">현재</div>
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div className="text-center">
                        <div className="text-lg font-bold">{cap.requiredLevel}</div>
                        <div className="text-[10px] text-muted-foreground">목표</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="visualization" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  기술 역량 레이더 (현재 vs 필요)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KYRadarChart data={radarData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  기술별 Gap 비교 (Gap 크기순)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KYGapBarChart data={gapBarData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
