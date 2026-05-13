"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterBar, type FilterConfig } from "@/components/filters/filter-bar";
import { useFilterParams } from "@/hooks/use-filter-params";
import { getUniqueValues } from "@/lib/filter-utils";
import { inspectionTypeLabel } from "@/lib/utils";
import { EquipmentMatrix } from "./equipment-matrix";
import type { EquipmentMaker, EquipmentModel } from "@/types/data";

interface EquipmentClientProps {
  makers: EquipmentMaker[];
  models: EquipmentModel[];
}

export function EquipmentClient({ makers, models }: EquipmentClientProps) {
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useFilterParams<Record<string, string>>({ country: "", inspectionType: "" });

  const countries = useMemo(() => getUniqueValues(makers, "country"), [makers]);
  const inspectionTypes = useMemo(
    () => [...new Set(models.flatMap((m) => m.inspectionTypes))].sort(),
    [models]
  );

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      { key: "country", label: "국가", options: countries },
      {
        key: "inspectionType",
        label: "검사유형",
        options: inspectionTypes,
        labelMap: Object.fromEntries(inspectionTypes.map((t) => [t, inspectionTypeLabel(t)])),
      },
    ],
    [countries, inspectionTypes]
  );

  const filteredMakers = useMemo(() => {
    let result = makers;
    if (filters.country) {
      result = result.filter((m) => m.country === filters.country);
    }
    if (filters.inspectionType) {
      result = result.filter((m) =>
        (m.models ?? []).some((mod) => mod.inspectionTypes.includes(filters.inspectionType))
      );
    }
    return result;
  }, [makers, filters.country, filters.inspectionType]);

  const filteredModels = useMemo(() => {
    const makerNames = new Set(filteredMakers.map((m) => m.name));
    let result = models.filter((m) => makerNames.has(m.makerName));
    if (filters.inspectionType) {
      result = result.filter((m) => m.inspectionTypes.includes(filters.inspectionType));
    }
    return result;
  }, [models, filteredMakers, filters.inspectionType]);

  const matrixTypes = useMemo(
    () => (filters.inspectionType ? [filters.inspectionType] : inspectionTypes),
    [inspectionTypes, filters.inspectionType]
  );

  const matrixData = useMemo(
    () =>
      matrixTypes.map((type) => {
        const row: Record<string, string | number | string[]> = {
          type,
          typeLabel: inspectionTypeLabel(type),
        };
        for (const maker of filteredMakers) {
          const makerModels = (maker.models ?? []).filter((m) =>
            m.inspectionTypes.includes(type)
          );
          row[maker.name] = makerModels.length;
          row[`${maker.name}__models`] = makerModels.map((m) => m.name);
        }
        return row;
      }),
    [matrixTypes, filteredMakers]
  );

  return (
    <div className="space-y-6">
      <FilterBar
        filters={filterConfigs}
        values={filters}
        onChange={setFilter}
        onClear={clearFilters}
        hasActive={hasActiveFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            검사 유형 × 장비 메이커 매트릭스
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentMatrix
            data={matrixData}
            makers={filteredMakers.map((m) => m.name)}
          />
        </CardContent>
      </Card>

      <h3 className="text-lg font-semibold">
        장비 메이커별 모델
        <span className="ml-2 text-sm text-muted-foreground font-normal">
          ({filteredMakers.length}개 메이커, {filteredModels.length}개 모델)
        </span>
      </h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMakers.map((maker) => {
          const makerModels = filteredModels.filter(
            (m) => m.makerName === maker.name
          );
          return (
            <Card key={maker.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{maker.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {maker.country}
                  </Badge>
                </div>
                {maker.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {maker.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {makerModels.map((model) => (
                    <div
                      key={model.name}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div>
                        <span className="text-sm font-medium">{model.name}</span>
                        {model.series && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({model.series})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {model.inspectionTypes.slice(0, 2).map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">
                            {inspectionTypeLabel(t)}
                          </Badge>
                        ))}
                        {model.inspectionTypes.length > 2 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{model.inspectionTypes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
