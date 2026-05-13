"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterBar, type FilterConfig } from "@/components/filters/filter-bar";
import { useFilterParams } from "@/hooks/use-filter-params";
import { getUniqueValues } from "@/lib/filter-utils";
import { gapLevelToColor } from "@/lib/utils";
import { GapHeatmap } from "@/components/charts/gap-heatmap";
import { TechDependencyGraph } from "@/components/charts/tech-dependency-graph";
import { ChevronDown, ChevronUp, ArrowRight, Zap, CheckCircle2, XCircle } from "lucide-react";
import type { Technology, TechRelation } from "@/types/data";

const CATEGORY_LABELS: Record<string, string> = {
  OPTICAL_SENSOR: "광학/센서",
  SOFTWARE_ALGORITHM: "소프트웨어/알고리즘",
  HARDWARE_MECHANICS: "하드웨어/메카닉스",
};

interface TechnologiesClientProps {
  technologies: Technology[];
}

export function TechnologiesClient({ technologies }: TechnologiesClientProps) {
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useFilterParams<Record<string, string>>({ category: "", gapLevel: "" });

  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const categories = useMemo(() => getUniqueValues(technologies, "category"), [technologies]);
  const gapLevels = useMemo(() => {
    const levels = new Set<string>();
    for (const t of technologies) {
      if (t.kyCapability) levels.add(t.kyCapability.gapLevel);
    }
    return [...levels].sort();
  }, [technologies]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      { key: "category", label: "카테고리", options: categories, labelMap: CATEGORY_LABELS },
      {
        key: "gapLevel",
        label: "Gap 수준",
        options: gapLevels,
        labelMap: { NONE: "없음", SMALL: "소규모", MEDIUM: "중규모", LARGE: "대규모" },
      },
    ],
    [categories, gapLevels]
  );

  const filtered = useMemo(() => {
    let result = technologies;
    if (filters.category) {
      result = result.filter((t) => t.category === filters.category);
    }
    if (filters.gapLevel) {
      result = result.filter((t) => t.kyCapability?.gapLevel === filters.gapLevel);
    }
    return result;
  }, [technologies, filters.category, filters.gapLevel]);

  const heatmapData = useMemo(
    () =>
      filtered
        .filter((t) => t.kyCapability)
        .map((t) => ({
          name: t.name,
          category: t.category,
          currentLevel: t.kyCapability!.currentLevel,
          requiredLevel: t.kyCapability!.requiredLevel,
          gapLevel: t.kyCapability!.gapLevel,
        })),
    [filtered]
  );

  const allRelations: TechRelation[] = useMemo(() => {
    const seen = new Set<string>();
    const result: TechRelation[] = [];
    for (const t of technologies) {
      if (!t.relations) continue;
      for (const r of t.relations) {
        const key = `${r.technologyName}::${r.relatedTechnology}::${r.relationType}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(r);
        }
      }
    }
    return result;
  }, [technologies]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Technology[]> = {};
    for (const t of filtered) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FilterBar
          filters={filterConfigs}
          values={filters}
          onChange={setFilter}
          onClear={clearFilters}
          hasActive={hasActiveFilters}
        />
        <span className="text-xs text-muted-foreground shrink-0">
          {filtered.length}개 기술
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            기술 Gap 히트맵 (현재 수준 vs 요구 수준)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GapHeatmap data={heatmapData} />
        </CardContent>
      </Card>

      {allRelations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              기술 의존성 그래프
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({allRelations.length}개 관계)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TechDependencyGraph
              technologies={technologies}
              relations={allRelations}
            />
          </CardContent>
        </Card>
      )}

      {Object.entries(groupedByCategory).map(([category, techs]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold">
            {CATEGORY_LABELS[category] ?? category}
            <span className="ml-2 text-sm text-muted-foreground font-normal">
              ({techs.length}개)
            </span>
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {techs.map((tech) => (
              <Card key={tech.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{tech.name}</CardTitle>
                    {tech.kyCapability && (
                      <Badge
                        className={gapLevelToColor(tech.kyCapability.gapLevel)}
                        variant="secondary"
                      >
                        {tech.kyCapability.gapLevel}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tech.description && (
                    <p className="text-xs text-muted-foreground">
                      {tech.description}
                    </p>
                  )}
                  {tech.kyCapability && (
                    <>
                      <div className="flex items-center gap-4 text-xs">
                        <span>
                          현재: <strong>{tech.kyCapability.currentLevel}/5</strong>
                        </span>
                        <span>
                          요구: <strong>{tech.kyCapability.requiredLevel}/5</strong>
                        </span>
                      </div>
                      {tech.kyCapability.improvementPlan && (
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              setExpandedPlan(
                                expandedPlan === tech.name ? null : tech.name
                              )
                            }
                          >
                            개선계획
                            {expandedPlan === tech.name ? (
                              <ChevronUp className="ml-1 h-3 w-3" />
                            ) : (
                              <ChevronDown className="ml-1 h-3 w-3" />
                            )}
                          </Button>
                          {expandedPlan === tech.name && (
                            <p className="text-xs text-muted-foreground mt-1 pl-2 border-l-2 border-primary/20">
                              {tech.kyCapability.improvementPlan}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {tech.specs && tech.specs.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">기술 스펙</p>
                      <div className="space-y-1">
                        {tech.specs.map((spec) => (
                          <div key={spec.specItem} className="flex items-center gap-1 text-[11px]">
                            {spec.isMet ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                            )}
                            <span className="text-muted-foreground">{spec.specItem}:</span>
                            <span className={spec.isMet ? "" : "text-red-600 font-medium"}>
                              {spec.currentSpec}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span>{spec.requiredSpec}</span>
                            <span className="text-muted-foreground">{spec.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tech.relations && tech.relations.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">기술 관계</p>
                      <div className="space-y-0.5">
                        {tech.relations
                          .filter((rel) => rel.technologyName === tech.name)
                          .slice(0, 3)
                          .map((rel) => (
                          <div key={`${rel.relatedTechnology}-${rel.relationType}`} className="flex items-center gap-1 text-[11px]">
                            {rel.relationType === "PREREQUISITE" ? (
                              <ArrowRight className="h-3 w-3 text-blue-500 shrink-0" />
                            ) : (
                              <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                            )}
                            <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                              {rel.relationType === "PREREQUISITE" ? "선행" : rel.relationType === "ENABLES" ? "기반" : "시너지"}
                            </Badge>
                            <span className="truncate">{rel.relatedTechnology}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tech.applicableProducts.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tech.applicableProducts.map((pName) => (
                        <Link
                          key={pName}
                          href={`/products/${encodeURIComponent(pName)}`}
                        >
                          <Badge
                            variant="outline"
                            className="text-[10px] cursor-pointer hover:bg-accent"
                          >
                            {pName}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
