"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { FilterBar, type FilterConfig } from "@/components/filters/filter-bar";
import { useFilterParams } from "@/hooks/use-filter-params";
import { getUniqueValues, filterByField } from "@/lib/filter-utils";

interface InspectionPointRow {
  id: string;
  name: string;
  purpose: string | null;
  inspectionType: string;
  inspectionTypeLabel: string;
  difficulty: string;
  difficultyStars: number;
  failureImpact: string | null;
  productName: string;
  productFamily: string;
  processStepName: string;
  processStepOrder: number;
  resolutionSpec: string | null;
  precisionSpec: string | null;
  speedSpec: string | null;
  fovSpec: string | null;
  keyEquipmentType: string | null;
}

const columns: ColumnDef<InspectionPointRow>[] = [
  {
    accessorKey: "productName",
    header: "제품",
    cell: ({ row }) => (
      <div>
        <span className="font-medium text-sm">{row.original.productName}</span>
        <Badge variant="outline" className="ml-2 text-[10px]">
          {row.original.productFamily}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "processStepName",
    header: "공정 단계",
    cell: ({ row }) => (
      <span className="text-sm">
        #{row.original.processStepOrder} {row.original.processStepName}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "검사 포인트",
    cell: ({ row }) => (
      <div>
        <span className="text-sm font-medium">{row.original.name}</span>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {row.original.purpose}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "inspectionTypeLabel",
    header: "검사 유형",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.inspectionTypeLabel}
      </Badge>
    ),
  },
  {
    accessorKey: "difficultyStars",
    header: "난이도",
    cell: ({ row }) => (
      <span className="text-xs">
        {"★".repeat(row.original.difficultyStars)}
        {"☆".repeat(5 - row.original.difficultyStars)}
      </span>
    ),
  },
  {
    accessorKey: "resolutionSpec",
    header: "검사 스펙",
    cell: ({ row }) => {
      const { resolutionSpec, precisionSpec, speedSpec, keyEquipmentType } = row.original;
      if (!resolutionSpec && !precisionSpec) return <span className="text-xs text-muted-foreground">-</span>;
      return (
        <div className="space-y-0.5">
          {resolutionSpec && (
            <div className="text-xs"><span className="text-muted-foreground">해상도:</span> {resolutionSpec}</div>
          )}
          {precisionSpec && (
            <div className="text-xs"><span className="text-muted-foreground">정밀도:</span> {precisionSpec}</div>
          )}
          {speedSpec && (
            <div className="text-xs"><span className="text-muted-foreground">속도:</span> {speedSpec}</div>
          )}
          {keyEquipmentType && (
            <Badge variant="outline" className="text-[10px] mt-0.5">{keyEquipmentType}</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "failureImpact",
    header: "실패 영향",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground line-clamp-2">
        {row.original.failureImpact ?? "-"}
      </span>
    ),
  },
];

export function InspectionPointsTable({ data }: { data: InspectionPointRow[] }) {
  const router = useRouter();
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useFilterParams<Record<string, string>>({
      product: "",
      family: "",
      inspectionType: "",
      difficulty: "",
    });

  const productOptions = useMemo(() => getUniqueValues(data, "productName"), [data]);
  const familyOptions = useMemo(() => getUniqueValues(data, "productFamily"), [data]);
  const typeOptions = useMemo(() => getUniqueValues(data, "inspectionTypeLabel"), [data]);
  const difficultyOptions = useMemo(() => getUniqueValues(data, "difficulty"), [data]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      { key: "product", label: "제품", options: productOptions },
      { key: "family", label: "제품군", options: familyOptions },
      { key: "inspectionType", label: "검사유형", options: typeOptions },
      { key: "difficulty", label: "난이도", options: difficultyOptions },
    ],
    [productOptions, familyOptions, typeOptions, difficultyOptions]
  );

  const filtered = useMemo(() => {
    let result = data;
    result = filterByField(result, "productName", filters.product);
    result = filterByField(result, "productFamily", filters.family);
    result = filterByField(result, "inspectionTypeLabel", filters.inspectionType);
    result = filterByField(result, "difficulty", filters.difficulty);
    return result;
  }, [data, filters]);

  return (
    <div className="space-y-3">
      <FilterBar
        filters={filterConfigs}
        values={filters}
        onChange={setFilter}
        onClear={clearFilters}
        hasActive={hasActiveFilters}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="검사 포인트 검색..."
        exportFilename="inspection-points"
        onRowClick={(row) =>
          router.push(`/products/${encodeURIComponent(row.productName)}`)
        }
      />
    </div>
  );
}
