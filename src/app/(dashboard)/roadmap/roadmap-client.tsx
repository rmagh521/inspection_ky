"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar, type FilterConfig } from "@/components/filters/filter-bar";
import { useFilterParams } from "@/hooks/use-filter-params";
import { getUniqueValues, getUniqueArrayValues } from "@/lib/filter-utils";
import {
  priorityToColor,
  difficultyToStars,
  formatInvestmentRange,
} from "@/lib/utils";
import { GanttChart } from "@/components/charts/gantt-chart";
import type { DevelopmentProject, StrategicAction } from "@/types/data";

interface RoadmapClientProps {
  projects: DevelopmentProject[];
  strategicActions: StrategicAction[];
}

const TIMELINE_LABELS: Record<string, string> = {
  SHORT_TERM: "단기 (0-12개월)",
  MID_TERM: "중기 (12-24개월)",
  LONG_TERM: "장기 (24-36개월)",
};

export function RoadmapClient({ projects, strategicActions }: RoadmapClientProps) {
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useFilterParams<Record<string, string>>({
      priority: "",
      status: "",
      family: "",
      timelineCategory: "",
    });

  const priorities = useMemo(() => getUniqueValues(projects, "priority"), [projects]);
  const statuses = useMemo(() => getUniqueValues(projects, "status"), [projects]);
  const families = useMemo(() => getUniqueArrayValues(projects, "targetFamilies"), [projects]);
  const timelineCategories = useMemo(() => getUniqueValues(projects, "timelineCategory"), [projects]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      { key: "priority", label: "우선순위", options: priorities },
      { key: "status", label: "상태", options: statuses },
      { key: "family", label: "대상 제품군", options: families },
      { key: "timelineCategory", label: "기간 구분", options: timelineCategories, labelMap: TIMELINE_LABELS },
    ],
    [priorities, statuses, families, timelineCategories]
  );

  const filtered = useMemo(() => {
    let result = projects;
    if (filters.priority) result = result.filter((p) => p.priority === filters.priority);
    if (filters.status) result = result.filter((p) => p.status === filters.status);
    if (filters.family) result = result.filter((p) => p.targetFamilies.includes(filters.family));
    if (filters.timelineCategory) result = result.filter((p) => p.timelineCategory === filters.timelineCategory);
    return result;
  }, [projects, filters]);

  const investmentSummary = useMemo(() => {
    const minTotal = filtered.reduce((sum, p) => sum + p.investmentMinMKRW, 0);
    const maxTotal = filtered.reduce((sum, p) => sum + p.investmentMaxMKRW, 0);
    return { minTotal, maxTotal, count: filtered.length };
  }, [filtered]);

  const filteredActions = useMemo(() => {
    if (!filters.timelineCategory) return strategicActions;
    return strategicActions.filter((a) => a.timelineCategory === filters.timelineCategory);
  }, [strategicActions, filters.timelineCategory]);

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filterConfigs}
        values={filters}
        onChange={setFilter}
        onClear={clearFilters}
        hasActive={hasActiveFilters}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">프로젝트 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investmentSummary.count}개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">최소 투자금액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investmentSummary.minTotal.toLocaleString()}백만원</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">최대 투자금액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investmentSummary.maxTotal.toLocaleString()}백만원</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gantt">
        <TabsList>
          <TabsTrigger value="gantt">간트 차트</TabsTrigger>
          <TabsTrigger value="projects">프로젝트 목록</TabsTrigger>
          <TabsTrigger value="strategic">전략 타임라인</TabsTrigger>
        </TabsList>

        <TabsContent value="gantt" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                개발 프로젝트 타임라인
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GanttChart projects={filtered} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <div className="space-y-3">
            {filtered.map((project) => (
              <Card key={project.name}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">
                          {project.name}
                        </span>
                        <Badge
                          className={priorityToColor(project.priority)}
                          variant="secondary"
                        >
                          {project.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          난이도: {"★".repeat(difficultyToStars(project.difficulty))}
                          {"☆".repeat(5 - difficultyToStars(project.difficulty))}
                        </span>
                        <span>
                          기간: {project.timelineMinMonths}-{project.timelineMaxMonths}개월
                        </span>
                        <span>
                          투자: {formatInvestmentRange(
                            project.investmentMinMKRW,
                            project.investmentMaxMKRW
                          )}
                        </span>
                        <span>
                          대상: {project.targetFamilies.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="strategic" className="mt-4">
          <div className="space-y-6">
            {["SHORT_TERM", "MID_TERM", "LONG_TERM"].map((cat) => {
              const actions = filteredActions.filter(
                (a) => a.timelineCategory === cat
              );
              if (actions.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="text-sm font-semibold mb-3">
                    {TIMELINE_LABELS[cat]}
                  </h3>
                  <div className="space-y-2">
                    {actions.map((action) => (
                      <Card key={`${action.area}-${action.action}`}>
                        <CardContent className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px]">
                                  {action.area}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {action.action}
                                </span>
                              </div>
                              {action.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {action.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
