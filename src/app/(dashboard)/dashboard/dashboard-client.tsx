"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterBar, type FilterConfig } from "@/components/filters/filter-bar";
import { useFilterParams } from "@/hooks/use-filter-params";
import { getUniqueValues, filterByField } from "@/lib/filter-utils";
import { priorityToColor } from "@/lib/utils";
import { InspectionTypeChart } from "@/components/charts/inspection-type-chart";
import { GapPieChart } from "@/components/charts/gap-pie-chart";
import { CoverageBarChart } from "@/components/charts/coverage-bar-chart";
import type { DashboardStats, Product } from "@/types/data";

interface DashboardClientProps {
  stats: DashboardStats;
  products: Product[];
}

export function DashboardClient({ stats, products }: DashboardClientProps) {
  const router = useRouter();
  const { filters, setFilter, clearFilters, hasActiveFilters } = useFilterParams<Record<string, string>>({
    family: "",
  });

  const families = useMemo(() => getUniqueValues(products, "family"), [products]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [{ key: "family", label: "제품군", options: families }],
    [families]
  );

  const filteredProducts = useMemo(
    () => filterByField(products, "family", filters.family),
    [products, filters.family]
  );
  const filteredProductNames = useMemo(
    () => new Set(filteredProducts.map((p) => p.name)),
    [filteredProducts]
  );

  const filteredCoverage = useMemo(
    () =>
      filters.family
        ? stats.coverageByProduct.filter((c) => filteredProductNames.has(c.product))
        : stats.coverageByProduct,
    [stats.coverageByProduct, filters.family, filteredProductNames]
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">검사 유형 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <InspectionTypeChart
              data={stats.inspectionTypeDistribution}
              onBarClick={(type) =>
                router.push(`/inspection-points?inspectionType=${type}`)
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">KY 기술 Gap 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <GapPieChart
              data={stats.gapDistribution}
              onSliceClick={(level) =>
                router.push(`/technologies?gapLevel=${level}`)
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">제품별 검사 커버리지</CardTitle>
          </CardHeader>
          <CardContent>
            <CoverageBarChart
              data={filteredCoverage}
              onBarClick={(product) =>
                router.push(`/products/${encodeURIComponent(product)}`)
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">개발 프로젝트 우선순위</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.projectsByPriority.map((item) => (
                <div key={item.priority} className="flex items-center justify-between">
                  <Badge className={priorityToColor(item.priority)} variant="secondary">
                    {item.priority}
                  </Badge>
                  <span className="text-sm font-medium">{item.count}건</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">주요 개발 프로젝트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentProjects.map((project) => (
                <div key={project.name} className="flex items-center justify-between gap-2">
                  <span className="text-sm truncate">{project.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={priorityToColor(project.priority)} variant="secondary">
                      {project.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
