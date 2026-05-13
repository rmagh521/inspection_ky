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
import type { KYProduct, KYCapability, KYProposalSpec, Product } from "@/types/data";

interface KYAnalysisClientProps {
  kyProducts: KYProduct[];
  capabilities: KYCapability[];
  proposalSpecs: KYProposalSpec[];
  products: Product[];
}

export function KYAnalysisClient({ kyProducts, capabilities, proposalSpecs, products }: KYAnalysisClientProps) {
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
          <TabsTrigger value="proposalSpecs">제안 스펙 Gap</TabsTrigger>
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

        <TabsContent value="proposalSpecs" className="mt-4">
          <ProposalSpecsTab proposalSpecs={proposalSpecs} products={products} />
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

function ProposalSpecsTab({
  proposalSpecs,
  products,
}: {
  proposalSpecs: KYProposalSpec[];
  products: Product[];
}) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const productNames = useMemo(
    () => [...new Set(proposalSpecs.map((ps) => ps.productName))].sort(),
    [proposalSpecs]
  );

  const filtered = useMemo(
    () => selectedProduct
      ? proposalSpecs.filter((ps) => ps.productName === selectedProduct)
      : proposalSpecs,
    [proposalSpecs, selectedProduct]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, KYProposalSpec[]>();
    for (const ps of filtered) {
      const key = `${ps.productName} > ${ps.processStepName} > ${ps.inspectionPointName}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ps);
    }
    return map;
  }, [filtered]);

  const specItems = useMemo(
    () => [...new Set(filtered.map((ps) => ps.specItem))],
    [filtered]
  );

  const summaryBySpecItem = useMemo(() => {
    return specItems.map((item) => {
      const specs = filtered.filter((ps) => ps.specItem === item);
      return { specItem: item, count: specs.length };
    }).sort((a, b) => b.count - a.count);
  }, [filtered, specItems]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">제품 필터:</span>
        <div className="flex flex-wrap gap-1">
          <Button
            variant={selectedProduct === "" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setSelectedProduct("")}
          >
            전체 ({proposalSpecs.length})
          </Button>
          {productNames.map((name) => (
            <Button
              key={name}
              variant={selectedProduct === name ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedProduct(name)}
            >
              {name} ({proposalSpecs.filter((ps) => ps.productName === name).length})
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{filtered.length}</div>
            <p className="text-xs text-muted-foreground">총 제안 스펙</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{grouped.size}</div>
            <p className="text-xs text-muted-foreground">검사 포인트</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{specItems.length}</div>
            <p className="text-xs text-muted-foreground">스펙 항목 종류</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {filtered.filter((ps) => ps.timeline.includes("6") || ps.timeline.includes("단기")).length}
            </div>
            <p className="text-xs text-muted-foreground">단기 달성 항목</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">스펙 항목별 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {summaryBySpecItem.map(({ specItem, count }) => (
              <Badge key={specItem} variant="outline" className="text-xs">
                {specItem}: {count}건
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {[...grouped.entries()].map(([key, specs]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{key}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-1.5 pr-3">스펙 항목</th>
                      <th className="text-left py-1.5 pr-3">시장 요구</th>
                      <th className="text-left py-1.5 pr-3">KY 현재</th>
                      <th className="text-left py-1.5 pr-3">KY 목표</th>
                      <th className="text-left py-1.5 pr-3">달성 전략</th>
                      <th className="text-left py-1.5">달성 시기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specs.map((ps) => (
                      <tr key={ps.specItem} className="border-b last:border-0">
                        <td className="py-1.5 pr-3 font-medium">{ps.specItem}</td>
                        <td className="py-1.5 pr-3">{ps.marketRequiredSpec}</td>
                        <td className="py-1.5 pr-3 text-orange-600">{ps.kyCurrentSpec}</td>
                        <td className="py-1.5 pr-3 text-blue-600">{ps.kyTargetSpec}</td>
                        <td className="py-1.5 pr-3 max-w-[200px] truncate" title={ps.achievementStrategy}>
                          {ps.achievementStrategy}
                        </td>
                        <td className="py-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            {ps.timeline}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
