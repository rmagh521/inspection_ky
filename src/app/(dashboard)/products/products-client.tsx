"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterBar, type FilterConfig } from "@/components/filters/filter-bar";
import { useFilterParams } from "@/hooks/use-filter-params";
import { getUniqueValues, filterByField } from "@/lib/filter-utils";
import type { Product, InspectionPoint, ProcessStep } from "@/types/data";

interface ProductsClientProps {
  products: Product[];
  steps: ProcessStep[];
  inspectionPoints: InspectionPoint[];
}

export function ProductsClient({ products, steps, inspectionPoints }: ProductsClientProps) {
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useFilterParams<Record<string, string>>({ family: "", isActive: "" });

  const families = useMemo(() => getUniqueValues(products, "family"), [products]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      { key: "family", label: "제품군", options: families },
      {
        key: "isActive",
        label: "상태",
        options: ["true", "false"],
        labelMap: { true: "활성", false: "비활성" },
      },
    ],
    [families]
  );

  const filtered = useMemo(() => {
    let result = filterByField(products, "family", filters.family);
    if (filters.isActive) {
      result = result.filter(
        (p) => String(p.isActive) === filters.isActive
      );
    }
    return result;
  }, [products, filters.family, filters.isActive]);

  const stepCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of steps) counts[s.productName] = (counts[s.productName] ?? 0) + 1;
    return counts;
  }, [steps]);

  const pointCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ip of inspectionPoints) counts[ip.productName] = (counts[ip.productName] ?? 0) + 1;
    return counts;
  }, [inspectionPoints]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar
          filters={filterConfigs}
          values={filters}
          onChange={setFilter}
          onClear={clearFilters}
          hasActive={hasActiveFilters}
        />
        <span className="text-xs text-muted-foreground shrink-0">
          {filtered.length}개 제품
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <Link
            key={product.name}
            href={`/products/${encodeURIComponent(product.name)}`}
          >
            <Card className="transition-shadow hover:shadow-md cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{product.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Badge variant="outline">{product.family}</Badge>
                  {!product.isActive && (
                    <Badge variant="secondary" className="text-xs">비활성</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>세대: {product.generation ?? "-"}</span>
                  <div className="flex gap-3">
                    <span>공정: {stepCounts[product.name] ?? 0}</span>
                    <span>검사포인트: {pointCounts[product.name] ?? 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
